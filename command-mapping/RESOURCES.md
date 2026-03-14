# RESOURCES Command Mapping

Mapping for `nsf resources` to generate application resources such as icons and splash screens.

## 1. Choose Resource
Select the type of resource to generate:
- **Icon**
- **Splashscreen**

## 2. Input Image Path
Input the real path of the image to be used for the icon or splashscreen.
- **Recommendation:** 1080x1080 pixels.

## 3. Input Background Color (Optional, Splashscreen only)
Input a background color code for the splashscreen (e.g., `#000000`).

## Equivalent NativeScript CLI Commands
- Icons: `ns resources generate icons <source_image_path>`
  - Example: `ns resources generate icons C:\...\myicon.png`
- Splash Screens: `ns resources generate splashes <source_image_path> --background <color_code>`
  - Example: `ns resources generate splashes C:\...\myicon.png --background #000000`
