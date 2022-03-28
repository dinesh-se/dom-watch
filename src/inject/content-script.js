(function() {
    const noOp = () => {};
    const config = { attributes: false, childList: true, subtree: true };
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      width: 300px;
      height: 40px;
      bottom: 200px;
      left: calc(50% - 150px);
      background: #e91e63;
      color: white;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    toast.innerText = 'Mail Arrived!';
    
    // This callback method executes when a change is observed in the page
    const callback = (mutationsList) => {
      for(const mutation of mutationsList) {
        if (!!mutation.type) {
          const nodes = Array.from(mutation.addedNodes);
          const check = nodes.some((node) => node.textContent.includes('TEST SUCCESS!!!'));
          if (check) {
            document.body.appendChild(toast);
          }
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

        document.addEventListener('mouseover', highlightElement);
        document.addEventListener('mouseout', resetElement);

        const selectTarget = (e) => {
          resetElement(e);
          document.removeEventListener('mouseover', highlightElement);
          document.removeEventListener('mouseout', resetElement);

          chrome.runtime.sendMessage(null, { status: 'observing' });
          observer.observe(e.target, config);
        }

        document.addEventListener('click', selectTarget, { once: true });

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            document.removeEventListener('mouseover', highlightElement);
            document.removeEventListener('mouseout', resetElement);
            document.removeEventListener('click', selectTarget);
          }
        });
      }

      if(request.action === 'stop-observing') {
        observer.disconnect();
        sendResponse(true);
      }
    });
})();
