const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { EventEmitter } = require("node:events");
const ts = require("typescript");
const compile = (file) =>
  ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
const registryCode = compile("src/utils/skill-sources.ts");
const commandCode = compile("src/commands/skill.ts");
function harness(
  answers = [],
  { platform = "win32", code = 0, signal = null, error = false } = {},
) {
  const registry = { exports: {} };
  vm.runInNewContext(registryCode, registry);
  const prompts = [],
    calls = [],
    messages = [];
  let cleanupCount = 0,
    outroCount = 0;
  const processState = { platform, cwd: () => "project directory with spaces" };
  const prompt = async (options) => {
    prompts.push(options);
    assert.ok(answers.length, `Unexpected prompt: ${options.message}`);
    const answer = answers.shift();
    if (typeof answer !== "symbol") {
      if (options.options)
        assert.ok(options.options.some((entry) => entry.value === answer));
      if (options.validate) assert.equal(options.validate(answer), undefined);
    }
    return answer;
  };
  const stubs = {
    "@clack/prompts": {
      select: prompt,
      confirm: prompt,
      text: prompt,
      isCancel: (value) => typeof value === "symbol",
      intro() {},
      outro() {
        outroCount++;
      },
      note: (...values) => messages.push(values.join("\n")),
      cancel: (value) => messages.push(value),
    },
    child_process: {
      spawn: (command, args, options) => {
        calls.push({ command, args: [...args], options });
        const child = new EventEmitter();
        setImmediate(() => {
          if (error) child.emit("error", new Error("not found"));
          child.emit("close", code, signal);
        });
        return child;
      },
    },
    "../utils/skill-sources": registry.exports,
    "../utils/ui": {
      BG_FORGE_COLOR: (value) => value,
      UI_STRINGS: { cancel: "Cancelled", outro: "Done" },
    },
    "../utils/process": {
      setupProcessCleanup: () => () => {
        cleanupCount++;
      },
    },
  };
  const context = {
    exports: {},
    process: processState,
    require: (name) => stubs[name] || require(name),
  };
  vm.runInNewContext(commandCode, context);
  return {
    ...context.exports,
    ...registry.exports,
    calls,
    prompts,
    messages,
    processState,
    get cleanupCount() {
      return cleanupCount;
    },
    get outroCount() {
      return outroCount;
    },
  };
}
for (const [id, repository] of [
  ["official", "NativeScript/skills"],
  ["nstudio", "nstudio/nativescript-agent-skills"],
]) {
  test(`List > ${id} > details > confirm > interactive installer`, async () => {
    const h = harness(["list", id, true]);
    await h.skillCommand();
    assert.equal(h.prompts.length, 3);
    assert.equal(h.prompts[0].message, "Select skill operation:");
    assert.deepEqual(
      Array.from(h.prompts[0].options, (entry) => entry.value),
      ["list", "guide", "__back__"],
    );
    const source = h.SKILL_SOURCES.find((entry) => entry.id === id);
    const details = h.messages[0];
    assert.ok(details.includes(source.description));
    for (const capability of source.capabilities)
      assert.ok(details.includes(capability));
    assert.ok(details.includes("https://github.com/" + repository));
    assert.ok(details.includes("/blob/main/README.md"));
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0].command, "npx.cmd");
    assert.deepEqual(h.calls[0].args, [
      "--yes",
      "skills@latest",
      "add",
      repository,
    ]);
    assert.equal(h.calls[0].options.stdio, "inherit");
    assert.equal(h.calls[0].options.shell, true);
    assert.equal(h.calls[0].options.cwd, "project directory with spaces");
    assert.equal(h.cleanupCount, 1);
    assert.equal(h.outroCount, 1);
    assert.ok(!h.calls[0].args.slice(2).includes("--yes"));
  });
  test(`Guide > ${id} shows collection-specific examples and never installs`, async () => {
    const h = harness(["guide", id, "__back__", "__back__"]);
    assert.equal(await h.skillCommand(), "back");
    assert.equal(h.prompts[1].message, "Select a skill collection guide:");
    assert.equal(h.prompts[2].message, "Select a skill collection guide:");
    const source = h.SKILL_SOURCES.find((entry) => entry.id === id);
    for (const example of source.examples)
      assert.ok(h.messages[0].includes(example));
    assert.ok(h.messages[0].includes(repository));
    assert.ok(h.messages[0].includes("How to use:"));
    assert.equal(h.calls.length, 0);
  });
}
test("List and Guide expose only curated collections and Go Back", async () => {
  for (const mode of ["list", "guide"]) {
    const h = harness(["__back__", "__back__"]);
    await h.skillCommand(mode);
    assert.deepEqual(
      Array.from(h.prompts[0].options, (entry) => entry.value),
      ["official", "nstudio", "__back__"],
    );
    assert.equal(h.calls.length, 0);
  }
});
test("direct install requires confirmation and uses no shell on POSIX", async () => {
  const h = harness([true], { platform: "linux" });
  await h.skillCommand("list", "official");
  assert.equal(h.prompts.length, 1);
  assert.equal(h.calls[0].command, "npx");
  assert.equal(h.calls[0].options.shell, false);
});
test("future curated collection appears in both List and Guide with its details", async () => {
  for (const mode of ["list", "guide"]) {
    const h = harness(
      mode === "list" ? ["extra", true] : ["extra", "__back__", "__back__"],
    );
    h.SKILL_SOURCES.push({
      id: "extra",
      label: "Extra Skills",
      repository: "acme/new-skills",
      description: "Future collection",
      capabilities: ["A future capability"],
      examples: ["An example for the new skill"],
    });
    await h.skillCommand(mode);
    assert.ok(h.messages[0].includes("A future capability"));
    if (mode === "list") assert.equal(h.calls[0].args[3], "acme/new-skills");
    else {
      assert.equal(h.calls.length, 0);
      assert.ok(h.messages[0].includes("An example for the new skill"));
    }
  }
});
test("Go Back at operations returns to main menu", async () => {
  const h = harness(["__back__"]);
  assert.equal(await h.skillCommand(), "back");
  assert.equal(h.calls.length, 0);
});
test("Go Back from collection list returns to List / Guide", async () => {
  const h = harness(["list", "__back__", "__back__"]);
  assert.equal(await h.skillCommand(), "back");
  assert.equal(h.prompts[2].message, "Select skill operation:");
  assert.equal(h.calls.length, 0);
});
test("declining installation returns to List without starting installer", async () => {
  const h = harness(["list", "official", false, "__back__", "__back__"]);
  assert.equal(await h.skillCommand(), "back");
  assert.equal(h.calls.length, 0);
  assert.equal(h.prompts[3].message, "Select a skill collection to install:");
});
test("declining lets user select another collection", async () => {
  const h = harness(["list", "official", false, "nstudio", true]);
  await h.skillCommand();
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].args[3], "nstudio/nativescript-agent-skills");
});
test("user can read a guide then switch to List and install", async () => {
  const h = harness(["guide", "official", "__back__", "list", "nstudio", true]);
  await h.skillCommand();
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].args[3], "nstudio/nativescript-agent-skills");
});
for (const prefix of [[], ["list"], ["list", "official"], ["guide"]]) {
  test(`cancel at ${prefix.join("/") || "operations"} never installs`, async () => {
    const h = harness([...prefix, Symbol("cancel")]);
    assert.equal(await h.skillCommand(), "back");
    assert.equal(h.calls.length, 0);
  });
}
test("direct guide without source opens guide collection selection", async () => {
  const h = harness(["official", "__back__", "__back__"]);
  assert.equal(await h.skillGuideCommand(), "back");
  assert.equal(h.prompts[0].message, "Select a skill collection guide:");
  assert.equal(h.calls.length, 0);
});
test("direct guide for a known source shows examples without prompting or installing", async () => {
  const h = harness();
  await h.skillGuideCommand("nstudio");
  assert.equal(h.calls.length, 0);
  assert.equal(h.prompts.length, 0);
  assert.equal(h.outroCount, 1);
  assert.ok(h.messages[0].includes("ns-android-java-interop-gotchas"));
});
test("only curated IDs are accepted, including direct commands", async () => {
  for (const id of [
    "",
    "acme/skills",
    "https://github.com/acme/skills",
    "--all",
    "official&echo bad",
    "official;echo",
    "official\n--all",
    "official%PATH%",
    "__custom__",
  ]) {
    for (const mode of ["list", "guide"]) {
      const h = harness();
      await h.skillCommand(mode, id);
      assert.equal(h.calls.length, 0, id);
      assert.equal(h.prompts.length, 0, id);
      assert.equal(h.processState.exitCode, 1, id);
    }
  }
  const h = harness([true]);
  await h.skillCommand("list", " nStudio ");
  assert.equal(h.calls[0].args[3], "nstudio/nativescript-agent-skills");
});
test("nonzero installer status propagates and cleanup runs", async () => {
  const h = harness([true], { code: 7 });
  await h.skillCommand("list", "official");
  assert.equal(h.processState.exitCode, 7);
  assert.equal(h.cleanupCount, 1);
  assert.equal(h.outroCount, 0);
});
test("signal termination is a failure", async () => {
  const h = harness([true], { code: null, signal: "SIGTERM" });
  await h.skillCommand("list", "official");
  assert.equal(h.processState.exitCode, 1);
  assert.ok(h.messages.some((value) => value.includes("SIGTERM")));
});
test("missing npx reports an error once and cleans up", async () => {
  const h = harness([true], { error: true, code: -2 });
  await h.skillCommand("list", "official");
  assert.equal(h.processState.exitCode, 1);
  assert.equal(h.cleanupCount, 1);
  assert.equal(h.outroCount, 0);
  assert.equal(
    h.messages.filter((value) => value.includes("Unable to start")).length,
    1,
  );
});
