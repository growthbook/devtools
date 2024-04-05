# Visual Editor

## Get it up and running locally

1. Run `yarn` to install dependencies
2. Run `yarn dev` to start the development server
3. In Chrome browser, go to `chrome://extensions`
    - Make sure the "Developer Mode" toggle is on
    - Click "Load Unpacked Extension", find this project's root directry, and select the `dist` directory
    - If you have the official GrowthBook extension installed, you will need to disable it to avoid conflicts
4. Log into GrowthBook (locally or on the web)
5. Find or create an experiment
6. Click the 'Launch Visual Editor'
    - It will ask for a URL. Enter the URL of the site you wish to edit
    - Click 'Open Visual Editor'. It won't actually open, because you're not using the prod version of the extension.
7. After the modal closes, click 'Open Visual Editor' on the experiment page.
8. In the modal that appears, click 'Proceed anyway'.
9. The Visual Editor should now be open and you can start editing the page.

## App architecture

High-level notes:

-   The Visual Editor is a Chrome extension that injects a script into the page you're editing.
-   The script is a React app that runs in the page you're editing.
-   The React app communicates with the GrowthBook web app to get data and send changes, via its background script.
-   The React app also communicates with the Chrome extension to get data and send changes, via `window.postMessage`.
-   The React app uses a lot of hooks to manage state and side effects.

### Hooks

-   useAiCopySuggestion

Exposes a `transformCopy` fn that makes a request to the background script. The background script makes a request to the GB backend and returns the AI-generated copy.

-   useApiKey

Used for loading and storing API credentials in local storage. Exclusively used in the extension options page.

-   useCustomJs

Manages custom JS that users can inject into their webpage. Accomplishes this by maintaining a 'global script tag' that is appended to the page.

-   useDragAndDrop

Facilitates the drag and drop feature. Attaches mouse event listeners to the document and manages the state of the dragged element and the drop target. Also draws a ghost element that follows the cursor while dragging.

-   useEditMode

Used for the main editing mode of the Visual Editor. Manages the state of the editor, including the selected element, the hovered element, the list of DOM mutations, and various methods to modify the DOM.

-   useFixedPositioning

Exposes CSS styling to apply to an element that needs to be fixed at specific X and Y coordinates on the page. Also exposes two methods to set X and Y. Used to position the Visual Editor on the page.

-   useFloatingAnchor

Takes a DOM element input and returns a [DOMRect](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect) with scroll, resize, and MutationObserver listeners baked-in. Used to position things relative to a specific DOM element, like the purple frame around the selected element, for example.

-   useGhostElement

See useDragAndDrop.

-   useGlobalCSS

Used for global CSS that users can inject into the page. Maintains a style tag that is appended to the head element.

-   useQueryParams

Processes the requisite query params in order to initialize the Visual Editor. Provides a method to clean them up without disturbing extraneous query params.

-   useSDKDiagnostics

Powers the Debug Panel for the Visual Editor. Surfaces info from the underlying SDK on the user's page.

-   useVisualChangeset

Houses main methods used to load and update a visual changeset. Exposes the experiment for the visual changeset, and any errors that occur during the process.

### Background script

The background script is a separate script that runs in the background of the extension. It is responsible for handling communication between the React app and the GrowthBook web app.

There are three main methods that the background script uses to communicate with the GrowthBook web app:

-   `fetchVisualChangeset`

Used on init and after every update to load the visual changeset in question.

-   `updateVisualChangeset`

Used when the user makes updates and changes are sent to GB.

-   `transformCopy`

For the AI copy generating feature.
