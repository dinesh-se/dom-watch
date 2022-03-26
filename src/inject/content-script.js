(function() {
    const noOp = () => {};
    const config = { attributes: false, childList: true, subtree: true };
    
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

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'pick-an-element') {
        sendResponse(true);
        let originalBoxShadow;

        const highlightElement = (e) => {
          originalBoxShadow = e.target.style.border;
          e.target.style.boxShadow = '0 0 2px 2px #e91e63';
          
          // When ESC is pressed, it was easy to remove all listerners 
          // but not possible to target the element to remove box shadow that's already applied
          // This is primarily introduced to reset box shadow for that reason
          setTimeout(() => {
            e.target.style.boxShadow = originalBoxShadow;
          }, 5000);
        };

        const resetElement = (e) => {
          e.target.style.boxShadow = originalBoxShadow;
        };

        window.addEventListener('mouseover', highlightElement);
        window.addEventListener('mouseout', resetElement);

        const selectTarget = (e) => {
          resetElement(e);
          window.removeEventListener('mouseover', highlightElement);
          window.removeEventListener('mouseout', resetElement);

          chrome.runtime.sendMessage(null, { status: 'observing'});
          observer.observe(e.target, config);
          window.removeEventListener('click', selectTarget);
        }

        window.addEventListener('click', selectTarget);

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            window.removeEventListener('mouseover', highlightElement);
            window.removeEventListener('mouseout', resetElement);
            window.removeEventListener('click', selectTarget);
          }
        });
      }

      if(request.action === 'stop-observing') {
        observer.disconnect();
        sendResponse(true);
      }
    });
})();
