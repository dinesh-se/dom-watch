import { logErrorMessage } from '../logger';

(function() {
    const noOp = () => {};
    const config = { attributes: true, childList: true, subtree: true };
    
    // This callback executes when a change is observed in the page
    const callback = (mutationsList) => {
      for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          chrome.runtime.sendMessage({ action: 'play-child-beep' }, noOp);
        } else if (mutation.type === 'attributes') {
          chrome.runtime.sendMessage({ action: 'play-attr-beep' }, noOp);
        }
      }
    };
    const observer = new MutationObserver(callback);

    try {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if(request.action === 'start-observing') {
          const targetNode = document.querySelector(request.selectorName);
          
          if (targetNode) {
            observer.observe(targetNode, config);
            sendResponse(true);
          } else {
            sendResponse(false);
          }
        }

        if(request.action === 'stop-observing') {
          observer.disconnect();
          sendResponse(true);
        }
      });
    } catch (e) {
      logErrorMessage(e, 7);
    }
})();
