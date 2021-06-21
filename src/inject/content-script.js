(function() {
  const config = { attributes: true, childList: true, subtree: true };
  const callback = function(mutationsList) {
    for(const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        chrome.runtime.sendMessage({ action: 'play-child-beep' });
      } else if (mutation.type === 'attributes') {
        chrome.runtime.sendMessage({ action: 'play-attr-beep' });
      }
    }
  };
  const observer = new MutationObserver(callback);

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
})();
