(async function() {
  const input = document.getElementById('selector-input');
  const startButton = document.getElementById('start-button');
  const stopButton = document.getElementById('stop-button');
  const message = document.getElementById('message');
  
  const getCurrentTab = async () => {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
  
    return tab;
  };

  const { id: currentTabId } = await getCurrentTab();

  input.addEventListener('input', (event) => {
    if (event.target.value) {
      startButton.disabled = false
    } else {
      startButton.disabled = true;
    }
  });
  
  startButton.addEventListener('click', async () => {
    const selectorName = document.getElementById('selector-input').value;
  
    if (selectorName) {
      chrome.tabs.sendMessage(currentTabId, { action: 'start-observing', selectorName }, ({result}) => {
        if(!result) {
          message.innerText = 'No Element found'
        } else {
          const tabDetails = {
            tabId: currentTabId,
            selectorName,
            startDisabled: true,
            stopDisabled: false,
            message: 'Observing for changes',
          };

          chrome.runtime.sendMessage({ action: 'update-tab-details', tabDetails });
          message.innerText = 'Observing for changes';
          input.disabled = true;
          startButton.disabled = true;
          stopButton.disabled = false;
        }
      });
    }
  });
  
  stopButton.addEventListener('click', async () => {
    chrome.tabs.sendMessage(currentTabId, { action: 'stop-observing' });
    chrome.runtime.sendMessage({ action: 'delete-tab-details', tabId: currentTabId });
    message.innerText = '';
    stopButton.disabled = true;
    input.disabled = false;
  });

  chrome.runtime.sendMessage({ action: 'get-tab-details', tabId: currentTabId }, (response) => {
    console.log('getting tab details', response);
    const {
      selectorName,
      startDisabled,
      stopDisabled,
      message: popupMessage,
    } = response;
    
    input.value = selectorName;
    input.disabled = !!selectorName;
    startButton.disabled = startDisabled;
    stopButton.disabled = stopDisabled;
    message.innerText = popupMessage;
  });
})();
