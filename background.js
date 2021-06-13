(function () {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    const { status, url } = changeInfo;

    if (!url) {
      if (status === 'loading') {
        chrome.storage.local.get(['tabsDetailsMap'], (result) => {
          const { tabsDetailsMap } = result;
          const selectorName = tabsDetailsMap[tabId] && tabsDetailsMap[tabId].selectorName;

          if (selectorName) {
            let attempts = 0;
            const interval = setInterval(() => {
              attempts++;
              chrome.tabs.sendMessage(tabId, { action: 'start-observing', selectorName }, (result) => {
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
})();
