(async function () {
  const input = document.getElementById('selector-input');
  const startButton = document.getElementById('start-button');
  const stopButton = document.getElementById('stop-button');
  const message = document.getElementById('message');
  const tabsDetailsMap = {};
  input.focus();
  
  const getCurrentTab = async () => {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
  
    return tab;
  };
  const { id: currentTabId } = await getCurrentTab();

  const renderUI = ({ selectorName = '' } = {}) => {
    if (selectorName) {
      input.value = selectorName;
      input.disabled = true;
      startButton.disabled = true;
      stopButton.disabled = false;
      message.innerText = 'Observing DOM changes';
    } else {
      input.value = '';
      input.disabled = false;
      startButton.disabled = true;
      stopButton.disabled = true;
      message.innerText = '';
    }
  };

  chrome.storage.local.get(['tabsDetailsMap'], (result) => {
    const { tabsDetailsMap: tabsDetails } = result;
    const tabPopupState = tabsDetails[currentTabId];
    
    renderUI(tabPopupState);
    Object.assign(tabsDetailsMap, tabsDetails);
  });

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
      chrome.tabs.sendMessage(currentTabId, { action: 'start-observing', selectorName }, (result) => {
        if(result) {
          const updatedTabsDetailsMap = {
            ...tabsDetailsMap,
            [currentTabId]: {
              selectorName,
            },
          };

          renderUI({ selectorName });
          chrome.storage.local.set({ tabsDetailsMap: updatedTabsDetailsMap});
        } else {
          message.innerText = 'No element found';
        }
      });
    }
  });
  
  stopButton.addEventListener('click', async () => {
    chrome.tabs.sendMessage(currentTabId, { action: 'stop-observing' });
    const isDeleted = delete tabsDetailsMap[currentTabId];
    
    if (isDeleted) {
      chrome.storage.local.set({ tabsDetailsMap });
    }

    renderUI();
  });
})();
