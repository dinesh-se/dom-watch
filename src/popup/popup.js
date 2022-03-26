import './popup.css';

(async function () {
  const pickButton = document.getElementById('pick-button');
  const stopButton = document.getElementById('stop-button');
  const status = document.getElementById('status');
  const tabsDetailsMap = {};
  
  const getCurrentTab = async () => {
    try {
      const queryOptions = { active: true, currentWindow: true };
      const [tab] = await chrome.tabs.query(queryOptions);
    
      return tab;
    } catch (e) {
      return null;
    }
  };

  const { id: currentTabId } = await getCurrentTab();

  const renderUI = ({ isObserving = false } = {}) => {
    if (isObserving) {
      pickButton.disabled = true;
      stopButton.disabled = false;
      status.innerText = 'Observing changes...';
      status.classList.add('listening');
    } else {
      pickButton.disabled = false;
      stopButton.disabled = true;
      status.innerText = `Click "Pick an element" button to select an element from the page and start listening for changes. Press ESC to discard selection.`;
      status.classList.remove('listening');
    }
  };

  if (currentTabId) {
    chrome.storage.local.get(['tabsDetailsMap'], (result) => {
      const { tabsDetailsMap: tabsDetails = {}} = result;
      const tabPopupState = tabsDetails[currentTabId];
      
      renderUI(tabPopupState);
      Object.assign(tabsDetailsMap, tabsDetails);
    });
  }

  pickButton.addEventListener('click', () => {
    chrome.tabs.sendMessage(currentTabId, { action: 'pick-an-element' }, (success) => {
      if (success) {
        window.close();
      }
    });
  });
  
  stopButton.addEventListener('click', () => {
    chrome.tabs.sendMessage(currentTabId, { action: 'stop-observing' }, (success) => {
      if (success) {
        chrome.action.setBadgeText({
          tabId: currentTabId,
          text: 'OFF',
        });
        const { popupWindowId } = tabsDetailsMap[currentTabId];
        const isDeleted = delete tabsDetailsMap[currentTabId];
        
        if (isDeleted) {
          chrome.windows.remove(popupWindowId);
          chrome.storage.local.set({ tabsDetailsMap });
        }
        renderUI();
      }
    });
  });
})();
