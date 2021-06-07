(function () {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    const { url } = changeInfo;
  
    if (url) {
      chrome.tabs.sendMessage(tabId, { action: 'stop-observing' });
      chrome.storage.local.get(['tabsDetailsMap'], (result) => {
        const { tabsDetailsMap } = result;
        const isDeleted = delete tabsDetailsMap[tabId];
    
        if (isDeleted) {
          chrome.storage.local.set({ tabsDetailsMap });
        }
      });
    }
  });
})();
