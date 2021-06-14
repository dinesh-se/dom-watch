(function () {
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

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    const { status, url } = changeInfo;

    if (!url) {
      if (status === 'loading') {
        chrome.storage.local.get(['tabsDetailsMap'], (result) => {
          const { tabsDetailsMap = {} } = result;
          const selectorName = tabsDetailsMap[tabId] && tabsDetailsMap[tabId].selectorName;

          if (selectorName) {
            let attempts = 0;
            const interval = setInterval(() => {
              attempts++;
              chrome.tabs.sendMessage(tabId, { action: 'start-observing', selectorName }, (result) => {
                if (result) {
                  chrome.action.setBadgeText({
                    text: 'ON',
                  });
                }

                if (result || attempts > 99) {
                  clearInterval(interval);
                }
              });
            }, 100);
          }
        });
      }
    } else {
      chrome.tabs.sendMessage(tabId, { action: 'stop-observing' }, (success) => {
        if (success) {
          console.log('offff');
          chrome.action.setBadgeText({
            text: 'OFF',
          });
          chrome.storage.local.get(['tabsDetailsMap'], (result) => {
            const { tabsDetailsMap } = result;
            const { popupWindowId } = tabsDetailsMap[currentTabId];
            const isDeleted = delete tabsDetailsMap[tabId];
        
            if (isDeleted) {
              chrome.windows.remove(popupWindowId);
              chrome.storage.local.set({ tabsDetailsMap });
            }
          });
        }
      });
    }
  });

  chrome.windows.onRemoved.addListener((windowId) => {
    chrome.storage.local.get(['tabsDetailsMap'], (result) => {
      const { tabsDetailsMap } = result;
      const tabId = Object.keys(tabsDetailsMap).find((tabId) => tabsDetailsMap[tabId].popupWindowId === windowId);
      const isDeleted = delete tabsDetailsMap[tabId];
      
      if (isDeleted) {
        chrome.tabs.sendMessage(parseInt(tabId), { action: 'stop-observing' }, (success) => {
          if (success) {
            console.log('offff');
            chrome.action.setBadgeText({
              text: 'OFF',
            });
            chrome.storage.local.set({ tabsDetailsMap });
          }
        });
      }
    });
  });
})();
