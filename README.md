# GrowthBook DevTools

Home of the:

-   Chrome DevTools extension that interfaces with the GrowthBook [Javascript](https://docs.growthbook.io/lib/js) and [React](https://docs.growthbook.io/lib/react) SDKs.
-   [Visual Editor](https://docs.growthbook.io/app/visual), used to create and edit variations for visual experiments.

DevTools Features

-   View all features and experiments used on the current page
-   Override assigned values to test all the different variations
-   Override targeting attributes to simulate what different users will see
-   Detailed logs explaining exactly why you got assigned a specific value

![DevTools Screenshot](/devtools-screenshot.png)

## Build and Release

To build and use this extension locally:

1. Run `yarn` to install dependencies
2. Run `yarn build` to create a new build
3. In Chrome, go to chrome://extensions
    - Make sure the "Developer Mode" toggle is on
    - Remove any existing GrowthBook devtool extensions
    - Click "Load Unpacked Extension" and select the `build` directory
4. Make changes and run `yarn build` again and it should update in Chrome automatically

To release a new version of the extension to the Chrome Web Store:

1. Increment the version in `public/manifest.json` and `package.json` (they should be the same)
2. Run `yarn package` to create a `build.zip` file
3. On the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/), go to Packages and upload the `build.zip` file
4. Add a changelog entry to the description describing your changes
5. Save the draft and submit for review
6. Make sure to commit and push the changes to GitHub as well

## Developing the Visual Editor

See the Visual Editor [CONTRIBUTING](/src/visual_editor/CONTRIBUTING.md) doc for more information on how to run the Visual Editor locally and develop it.

## Contributing

Some notes

-   HTML files go into `public/` and are **copied** by the build into `dist/`
-   TS/TSX files go into `src/` and are **compiled** by the build and put into `dist/`
-   Other assets such as icons, images, and the `manifest.json` are kept in `public/` and also copied into `dist/` on build
