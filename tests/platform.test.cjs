const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { EventEmitter } = require("node:events");
const ts = require("typescript");

const code = ts.transpileModule(
  fs.readFileSync("src/commands/platform.ts", "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  },
).outputText;

function harness(answers = [], exitCode = 0, startupError = false) {
  const prompts = [],
    calls = [],
    messages = [],
    processState = {};
  let cleanupCount = 0;
  const prompt = async (options) => {
    prompts.push(options);
    assert.ok(answers.length, `Unexpected prompt: ${options.message}`);
    const answer = answers.shift();
    if (typeof answer !== "symbol") {
      if (options.options)
        assert.ok(options.options.some((option) => option.value === answer));
      if (options.validate) assert.equal(options.validate(answer), undefined);
    }
    return answer;
  };
  const stubs = {
    "@clack/prompts": {
      select: prompt,
      text: prompt,
      isCancel: (value) => typeof value === "symbol",
      intro() {},
      outro() {},
      cancel: (message) => messages.push(message),
      spinner: () => ({ start() {}, stop() {} }),
    },
    child_process: {
      spawn: (command, args) => {
        calls.push({ command, args: [...args] });
        const child = new EventEmitter();
        child.stdout = new EventEmitter();
        child.stderr = new EventEmitter();
        setImmediate(() => {
          if (startupError) child.emit("error", new Error("unavailable"));
          else {
            child.stdout.emit("data", "platform output");
            child.stderr.emit("data", "diagnostic output");
          }
          child.emit("close", startupError ? -2 : exitCode, null);
        });
        return child;
      },
    },
    "../utils/process": {
      setupProcessCleanup: () => () => {
        cleanupCount++;
      },
    },
    "../utils/ui": {
      BG_FORGE_COLOR: (value) => value,
      UI_STRINGS: { cancel: "Cancelled", outro: "Done" },
    },
  };
  const context = {
    exports: {},
    require: (name) => stubs[name] || require(name),
    process: processState,
    console: { log: (...values) => messages.push(values.join(" ")) },
  };
  vm.runInNewContext(code, context);
  return {
    ...context.exports,
    prompts,
    calls,
    messages,
    processState,
    get cleanupCount() {
      return cleanupCount;
    },
  };
}

for (const platform of ["android", "ios", "visionos"]) {
  for (const action of ["add", "remove", "update", "clean"]) {
    test(`interactive ${action} ${platform}`, async () => {
      const answers = [action, platform];
      if (action === "add" || action === "update") answers.push("latest");
      const h = harness(answers);
      await h.platformCommand();
      assert.deepEqual(h.calls, [
        { command: "ns", args: ["platform", action, platform] },
      ]);
      assert.equal(
        h.prompts.length,
        action === "add" || action === "update" ? 3 : 2,
      );
      assert.ok(h.messages.some((value) => value.includes("platform output")));
      assert.ok(
        h.messages.some((value) => value.includes("diagnostic output")),
      );
      assert.equal(h.cleanupCount, 1);
    });
  }
}
test("list skips platform and runtime selection", async () => {
  const h = harness(["list"]);
  await h.platformCommand();
  assert.equal(h.prompts.length, 1);
  assert.deepEqual(h.calls[0].args, ["platform", "list"]);
});
for (const source of ["next", "version"]) {
  test(`runtime ${source}`, async () => {
    const h = harness([
      "add",
      "android",
      source,
      ...(source === "version" ? ["9.0.0-rc.1"] : []),
    ]);
    await h.platformCommand();
    assert.equal(
      h.calls[0].args[2],
      source === "next" ? "android@next" : "android@9.0.0-rc.1",
    );
  });
}
test("Go Back from operations returns to main menu without executing", async () => {
  const h = harness(["__back__"]);
  assert.equal(await h.platformCommand(), "back");
  assert.equal(h.calls.length, 0);
});
test("Go Back from platform returns to operations", async () => {
  const h = harness(["remove", "__back__", "list"]);
  await h.platformCommand();
  assert.equal(h.prompts[2].message, "Select platform operation:");
  assert.deepEqual(h.calls[0].args, ["platform", "list"]);
});
test("Go Back from runtime returns to platform selection", async () => {
  const h = harness(["add", "android", "__back__", "ios", "latest"]);
  await h.platformCommand();
  assert.equal(h.prompts[3].message, "Select platform:");
  assert.deepEqual(h.calls[0].args, ["platform", "add", "ios"]);
});
for (const prefix of [
  [],
  ["add"],
  ["add", "android"],
  ["add", "android", "version"],
]) {
  test(`cancel after ${prefix.length} selections never executes`, async () => {
    const h = harness([...prefix, Symbol("cancel")]);
    assert.equal(await h.platformCommand(), "back");
    assert.equal(h.calls.length, 0);
  });
}
test("direct action without target prompts for platform", async () => {
  const h = harness(["ios"]);
  await h.platformCommand("remove");
  assert.equal(h.prompts[0].message, "Select platform:");
  assert.deepEqual(h.calls[0].args, ["platform", "remove", "ios"]);
});
test("direct action with target skips prompts", async () => {
  const h = harness();
  await h.platformCommand("update", "ios@9.0.0");
  assert.equal(h.prompts.length, 0);
  assert.deepEqual(h.calls[0].args, ["platform", "update", "ios@9.0.0"]);
});
for (const target of [
  "android&echo injected",
  "android;echo",
  "invalid",
  "ios@9.0.0",
]) {
  test(`reject invalid remove target ${target}`, async () => {
    const h = harness();
    await h.platformCommand("remove", target);
    assert.equal(h.calls.length, 0);
    assert.equal(h.processState.exitCode, 1);
  });
}
test("runtime input rejects shell metacharacters and empty values", async () => {
  const h = harness(["add", "android", "version", "9.0.0"]);
  await h.platformCommand();
  const validate = h.prompts[3].validate;
  for (const value of ["", "  ", "9&echo", "9;echo", "$(echo)", "9\nfoo"])
    assert.ok(validate(value));
});
test("preserves nonzero exit code and cleans up", async () => {
  const h = harness([], 7);
  await h.platformListCommand();
  assert.equal(h.processState.exitCode, 7);
  assert.equal(h.cleanupCount, 1);
});
test("startup error reports once and cleans up", async () => {
  const h = harness([], 0, true);
  await h.platformListCommand();
  assert.equal(h.processState.exitCode, 1);
  assert.equal(h.cleanupCount, 1);
  assert.equal(h.messages.length, 1);
});
