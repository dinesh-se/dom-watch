# ![Page Watch logo](./src/assets/images/popup.png)

Chrome browser extension to observe changes in a webpage. It uses `MutationObserver` to detect the changes. Pass a valid element selector in the input field and it will start observing the changes in the page (where possible). The extension is page scoped, which means that multiple pages can be observed at the same time.

## Demo
VIDEO PLACEHOLDER

## Applications
In its current version, the extension emits a beep sound whenever a child element is added/removed, or when any attribute of the targetted element changes. The selected element can be `body` tag to observe entire page or any section of the page. However, with minor code changes, this may be extended to cover a variety of use cases.

For example, it's possible to keep track of stock or crypto prices displayed on an asynchronously updating page.

Other application areas includes visa appointment booking system, alerting on when a person comes online or when an important mail that you are waiting for arrives, skipping YouTube ads, steam marketplace and whereever live feed is available. Besides that, UI observability may be used on REST endpoints where rate-limiting is in effect.
## Working Details
This is how the extension works at a high level. The `Popup` component receives a input to find an element in the page. If the element is found, it will send a message to [content-script.js](./src/inject/content-script.js) which was injected into webpage. When the message is received, the injected script starts observing the element and send a message to `playback` component to play sounds. The rationale for creating the `playback` component to play sounds is a different story which I'll explain in a blog post later. Other programming logic involves maintaining the popup UI up-to-date, preserving state across tabs and updating the extension badge.

The `callback` method in [content-script.js](./src/inject/content-script.js#5) may be updated to handle a different approach when a change is detected.

```
const callback = (mutationsList) => {
  for(const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      // when a child is added or removed
      // Config should have childList set to true

      chrome.runtime.sendMessage({ action: 'play-child-beep' }, noOp);
    } else if (mutation.type === 'attributes') { 
      // when attribute changes
      // Config should have attributes set to true

      chrome.runtime.sendMessage({ action: 'play-attr-beep' }, noOp);
    }

    // When subTree is set to true, childList and 
    // attributes will be checked recursively against all 
    // the child elements
  }
};
```
