import './popup.css';

(async function () {
  const input = document.getElementById('selector-input');
  const startButton = document.getElementById('start-button');
  const stopButton = document.getElementById('stop-button');
  const message = document.getElementById('message');
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
  
  const createPopupWindow = async () => {
    try {
      const { id } = await chrome.windows.create({
        focused: false,
        height: 200,
        type: 'popup',
        width: 200,
        url: chrome.runtime.getURL('playback/playback.html'),
      });

      return id;
    } catch (e) {
      return null;
    }
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

  if (currentTabId) {
    chrome.storage.local.get(['tabsDetailsMap'], (result) => {
      const { tabsDetailsMap: tabsDetails = {}} = result;
      const tabPopupState = tabsDetails[currentTabId];
      
      input.focus();
      renderUI(tabPopupState);
      Object.assign(tabsDetailsMap, tabsDetails);
    });
  }

  input.addEventListener('input', (event) => {
    if (event.target.value) {
      startButton.disabled = false
    } else {
      startButton.disabled = true;
    }
  });
  
  startButton.addEventListener('click', () => {
    const selectorName = document.getElementById('selector-input').value;
  
    if (selectorName && currentTabId) {
      try {
        chrome.tabs.sendMessage(currentTabId, { action: 'start-observing', selectorName }, async (success) => {
          console.log('PP - SIGNAL SENT');
          if(success) {
            chrome.action.setBadgeText({
              text: 'ON',
            });
            const popupWindowId = await createPopupWindow();

            if (popupWindowId) {
              const updatedTabsDetailsMap = {
                ...tabsDetailsMap,
                [currentTabId]: {
                  selectorName,
                  popupWindowId,
                },
              };
  
              renderUI({ selectorName });
              chrome.storage.local.set({ tabsDetailsMap: updatedTabsDetailsMap});
            }
          } else {
            message.innerText = 'No element found';
          }
        });
      } catch (e) {
        console.error('ERROR:', e);
      }
    }
  });
  
  stopButton.addEventListener('click', () => {
    try {
      chrome.tabs.sendMessage(currentTabId, { action: 'stop-observing' }, (success) => {
        if (success) {
          chrome.action.setBadgeText({
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
    } catch (e) {
      console.error('POPUP - ERROR ON ENDING:', e);
    }
  });
})();
