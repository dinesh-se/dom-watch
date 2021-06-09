(function() {
  const config = { attributes: true, childList: true, subtree: true };

  const callback = function(mutationsList) {
    const childBeep = new Audio(chrome.runtime.getURL('assets/audio/child.mp3'));
    const attrBeep = new Audio(chrome.runtime.getURL('assets/audio/attr.mp3'));

      for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          childBeep.play();
        } else if (mutation.type === 'attributes') {
          attrBeep.play();
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
    }
  });
})();
