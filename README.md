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

To run the Visual Editor locally and to be able to develop it:

1. Follow steps 1 - 3 in the above 'Build and Release' section to get Chrome Extension loaded locally in your browser.
2. Log into the GrowthBook web app.
3. Create or navigate to an Experiment.
4. Once created, click the CTA for 'Open Visual Editor'.
    1. If the experiment is new, it will ask you for a URL. Enter the URL of the site you wish to edit.
5. When running a dev version of the Chrome Extension, the GB app will give you a warning that it does not detect the editor. This is okay - Click 'Proceed anyway' to move further.
6. Viola! You should see the Visual Editor load.
    1. In the case that you don't, you'll probably see an error message regarding the CSP of the website you're trying to hit. This will require some configuration on the website's side to loosen restrictions - read our docs to [see what is required](https://docs.growthbook.io/app/visual#security-requirements).

## Contributing

Some notes

-   HTML files go into `public/` and are **copied** by the build into `dist/`
-   TS/TSX files go into `src/` and are **compiled** by the build and put into `dist/`
-   Other assets such as icons, images, and the `manifest.json` are kept in `public/` and also copied into `dist/` on build
