(function() {
  const input = document.getElementById('selector-input');
  const startButton = document.getElementById('start-button');
  const stopButton = document.getElementById('stop-button');
  const message = document.getElementById('message');
  
  const getCurrentTab = async () => {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
  
    return tab;
  };

  input.addEventListener('input', (event) => {
    if (event.target.value) {
      startButton.disabled = false
    } else {
      startButton.disabled = true;
    }
  });
  
  startButton.addEventListener('click', async () => {
    const selectorName = document.getElementById('selector-input').value;
    const { id: tabId } = await getCurrentTab();
  
    if (selectorName) {
      chrome.tabs.sendMessage(tabId, { action: 'start', selectorName }, (result) => {
        if(!result) {
          message.innerText = 'No Element found'
        } else {
          message.innerText = 'Observing for changes';
          input.disabled = true;
          startButton.disabled = true;
          stopButton.disabled = false;
        }
      });
    }
  });
  
  stopButton.addEventListener('click', async () => {
    const { id: tabId } = await getCurrentTab();
  
    chrome.tabs.sendMessage(tabId, { action: 'stop' });
    message.innerText = '';
    stopButton.disabled = true;
    input.disabled = false;
  });
})();
