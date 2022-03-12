(function() {
  const config = { attributes: true, childList: true, subtree: true };
  const callback = (mutationsList) => {
    for(const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        chrome.runtime.sendMessage({ action: 'play-child-beep' });
      } else if (mutation.type === 'attributes') {
        chrome.runtime.sendMessage({ action: 'play-attr-beep' });
      }
    }
  };
  const observer = new MutationObserver(callback);

  try {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if(request.action === 'start-observing') {
        console.log('SIGNAL RECEIVED');
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
    console.error('LISTENING FAILED', e);
  }
})();
