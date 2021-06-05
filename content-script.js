(function() {
  const config = { attributes: true, childList: true, subtree: true };

  const callback = function(mutationsList) {
    const childBeep = new Audio(chrome.runtime.getURL('assets/child.mp3'));
    const attrBeep = new Audio(chrome.runtime.getURL('assets/attr.mp3'));

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
    if(request.action === 'start') {
      const targetNode = document.querySelector(request.selectorName);
      
      if (targetNode) {
        observer.observe(targetNode, config);
        sendResponse({result: 'success'})
      } else {
        sendResponse({result: null})
      }
    }
    if(request.action === 'stop') {
      observer.disconnect();
    }
  });
})();
