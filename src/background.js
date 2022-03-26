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

  // when the page refreshes, it won't listen for changes
  // this block will remove the playback window and references related to this tab
  // and reset to original state
  if (!url && status === 'loading') {
    chrome.action.setBadgeText({
      tabId,
      text: 'OFF',
    });
    const { popupWindowId } = tabsDetailsMap[tabId];
    const isDeleted = delete tabsDetailsMap[tabId];
    
    if (isDeleted) {
      chrome.windows.remove(popupWindowId);
      chrome.storage.local.set({ tabsDetailsMap });
    }
  }
});

// when the playbak window is closed directly
// the references to the tab it was attached will be removed
// and reset to original state
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

const getCurrentTab = async () => {
  try {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
  
    return tab;
  } catch (e) {
    return null;
  }
};

chrome.runtime.onMessage.addListener(async ({ status }) => {
  if(status === 'observing') {
    const { id: currentTabId } = await getCurrentTab();
    chrome.action.setBadgeText({
      tabId: currentTabId,
      text: 'ON',
    });
    const popupWindowId = await createPopupWindow();
    chrome.storage.local.get(['tabsDetailsMap'], (result) => {
      const { tabsDetailsMap: tabsDetails = {}} = result;

      if (popupWindowId) {
        const updatedTabsDetailsMap = {
          ...tabsDetails,
          [currentTabId]: {
            popupWindowId,
            isObserving: true,
          },
        };

        chrome.storage.local.set({ tabsDetailsMap: updatedTabsDetailsMap});
      }
    });
  }
});
