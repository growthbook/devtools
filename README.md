# GrowthBook DevTools

Home of the:

- Chrome DevTools extension that interfaces with the GrowthBook [Javascript](https://docs.growthbook.io/lib/js) and [React](https://docs.growthbook.io/lib/react) SDKs.
- [Visual Editor](https://docs.growthbook.io/app/visual), used to create and edit variations for visual experiments.

DevTools features:

- View all features and experiments used on the current page
- Override assigned values to test all the different variations
- Override targeting attributes to simulate what different users will see
- Detailed logs explaining exactly why you got assigned a specific value

![DevTools Screenshot](/devtools-screenshot.jpg)

## Build and Release

To build and use this extension locally:

1. Run `yarn` to install dependencies
2. Run `yarn build:chrome` or `yarn build:firefox` to create a new build
3. Chrome, go to chrome://extensions
   - Chrome:
      - Make sure the "Developer Mode" toggle is on
      - Remove any existing GrowthBook devtool extensions
      - Click "Load Unpacked Extension" and select the `dist` directory
   - Firefox:
     - Similar to Chrome, except you must select any single arbitrary file within the `dist` directory
4. To enable hot-reloading, run `yarn dev` which will pick up most changes automatically
5. For changes to certain files (content_script, background), you also need to refresh the extension
   - Chrome: right click the extension icon -> Manage Extension -> refresh button in the top right corner
   - Firefox: right click the extension icon -> Manage Extension -> gear icon -> Debug Add-ons -> reload button


## Publishing

### Chrome Web Store:

1. Increment the version in `public/manifest.chrome.json` and `package.json` (they should be the same)
2. Run `yarn package:chrome` to create a `build.chrome.zip` file
3. On the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/), go to Packages and upload the `build.chrome.zip` file
4. Add a changelog entry to the description describing your changes
5. Save the draft and submit for review
6. Make sure to commit and push the changes to GitHub as well

### Firefox (addons.mozilla.org):
1. Same as above, but for `public/manifest.firefox.json`
2. Run `yarn package:firefox` to create a `build.firefox.zip` file
3. Upload to [addons.mozilla.org](https://addons.mozilla.org)
4. Etc...

## Developing the Visual Editor

See the Visual Editor [CONTRIBUTING](/src/visual_editor/CONTRIBUTING.md) doc for more information on how to run the Visual Editor locally and develop it.

## Contributing

Some notes

- HTML files go into `public/` and are **copied** by the build into `dist/`
- TS/TSX files go into `src/` and are **compiled** by the build and put into `dist/`
- Other assets such as icons, images, and the `manifest.json` are kept in `public/` and also copied into `dist/` on build

## Changelog

*1.0.4* (2025-03-05)
- Ability to clear individual attribute overrides
- Bug fixes (legacy SDK support, prevent attribute caching, search)

*1.0.3* (2025-03-03)
- Allow inspecting & overriding features not in the SDK payload (stale or unpublished features)
- Allow overriding feature value types
- Bug fixes (special chars in feature keys, legacy SDK support, type safety)
- Warn when using outdated SDK version

*1.0.2* (2025-02-27)
- DevTools + Visual Editor for Firefox
- Bug fixes (persist overrides between page loads, better handling of missing API keys)

*1.0.1* (2025-02-24)
- Dark mode
- Log tracking calls in debug logger
- Bug fixes and legacy SDK support

*1.0.0* (2025-02-21)
- Brand new DevTools application
- Runs docked or in popup mode (click the extension icon)
- Does not affect Visual Editor

*0.4.1* (2024-10-03)
- Fix bugs with selectors and inline editing

*0.4.0* (2024-09-26)
- Allow inline editing (contentEditable)
- Fix bugs causing occasional crashes
- Minor UI improvements

*0.3.9* (2024-08-20)
- Fix some text entry field bugs
- Fix bug where `cursor: move` is appended to mutations
- Add pop-up menu
- Bump SDK verison (1.2.0)

*0.3.8* (2024-07-08)
- Enforce charset for visual_editor.js
- Bump GB SDK version to latest (1.1.0)

*0.3.7* (2024-04-09)
- Optimize global CSS editing
- Allow access in incognito mode
- Display SDK diagnostics in DevTools
- Added documentation

*0.3.6* (2024-02-28)
- Updates & bug fixes

*0.3.4* (2023-11-21)
- Bug fixes

*0.3.3* (2023-11-13)
- Improved drag and drop
- SDK warnings and detection
- DebugPanel
- General UI improvements and bug fixes

*0.3.2* (2023-08-28)
- Update dependencies

*0.3.1* (2023-08-15)
- Security fixes and performance improvements
- Visual editor - OpenAI copy suggestions (beta)

*0.3.0* (2023-06-06)
- Visual editor - ability to inject custom javascript as part of a test
- Visual editor - modify inline CSS properties
- Various bug fixes for visual editor

*0.2.2* (2023-05-03)
- Visual editor - ability to re-arrange elements on the page and undo button for innerHTML changes
- Various bug fixes for visual editor

*0.2.1* (2023-04-03)
- Bug fixes for visual editor
- Only include visual editor script on pages with the `vc-id` querystring parameter (fixes conflicts on some websites)

*0.2.0* (2023-03-28)
- Integrate the new Visual Editor
- Switch to a custom webpack build process instead of Create React App

*0.1.3* (2022-10-17)
- Improve error message when GrowthBook SDK is not detected

*0.1.2* (2022-06-08)
- Fix bug: forcing experiment variations in devtools was not updating feature values correctly in the UI

*0.1.1*  (2022-01-22)
- Support for context.overrides
- UI improvements for boolean feature flags
- Auto-sync devtools when page's GrowthBook instance changes
- Visually show variation weights in an experiment

*0.1.0*  (2022-01-05)
- Initial release

