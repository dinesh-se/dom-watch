(function () {
  try {
    chrome.tabs.onActivated.addListener(async () => {
      const queryOptions = { active: true, currentWindow: true };
      const [tab] = await chrome.tabs.query(queryOptions);
      
      chrome.storage.local.get(['tabsDetailsMap'], (result) => {
        const { tabsDetailsMap = {} } = result;

        if (!!tabsDetailsMap[tab.id]) {
          chrome.action.setBadgeText({
            text: 'ON',
          });
        } else {
          chrome.action.setBadgeText({
            text: 'OFF',
          });
        }
      });
    });
  } catch (e) {
    console.error('ERROR ON TAB ACTIVATION', e);
  } 

  try {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      const { status, url } = changeInfo;

      if (!url && status === 'loading') {
        chrome.storage.local.get(['tabsDetailsMap'], (result) => {
          const { tabsDetailsMap = {} } = result;
          const selectorName = tabsDetailsMap[tabId] && tabsDetailsMap[tabId].selectorName;

          if (selectorName) {
            let attempts = 0;
            const interval = setInterval(() => {
              attempts++;
              try {
                chrome.tabs.sendMessage(tabId, { action: 'start-observing', selectorName }, (result) => {
                  console.log('BG - SIGNAL START', result);
                  if (result) {
                    chrome.action.setBadgeText({
                      text: 'ON',
                    });
                  }

                  if (result || attempts > 99) {
                    clearInterval(interval);
                  }
                });
              } catch (e) {
                console.error('BG - ERROR ON SENDING:', e);
              }
            }, 100);
          }
        });
      }
    });
  } catch (e) {
    console.error('ERROR ON TAB UPDATE', e);
  }

  try {
    chrome.windows.onRemoved.addListener((windowId) => {
      chrome.storage.local.get(['tabsDetailsMap'], (result) => {
        const { tabsDetailsMap } = result;
        const tabId = Object.keys(tabsDetailsMap).find((tabId) => tabsDetailsMap[tabId].popupWindowId === windowId);

        if (tabId) {
          const isDeleted = delete tabsDetailsMap[tabId];
        
          if (isDeleted) {
            chrome.tabs.sendMessage(parseInt(tabId), { action: 'stop-observing' }, (success) => {
              if (success) {
                chrome.action.setBadgeText({
                  text: 'OFF',
                });
                chrome.storage.local.set({ tabsDetailsMap });
              }
            });
          }
        }
      });
    });
  } catch (e) {
    console.error('ERROR ON TAB REMOVAL');
  }
})();
