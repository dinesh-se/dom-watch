const setBadgeText = async ({ tabId }) => {
  chrome.storage.local.get(['tabsDetailsMap'], async (result) => {
    const { tabsDetailsMap = {} } = result;

    if (!!tabsDetailsMap[tabId]) {
      await chrome.action.setBadgeText({
        tabId,
        text: 'ON',
      });
    } else {
      await chrome.action.setBadgeText({
        tabId,
        text: 'OFF',
      });
    }
  });
}

chrome.tabs.onActivated.addListener(setBadgeText);
chrome.tabs.onUpdated.addListener(setBadgeText);

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

const clearOnNavigation = async ({tabId, url, transitionType}) => {
  if (['reload', 'link', 'typed', 'generated'].includes(transitionType)) {
    await chrome.action.setBadgeText({
      tabId,
      text: 'OFF',
    });
    chrome.storage.local.get(['tabsDetailsMap'], async(result) => {
      const { tabsDetailsMap } = result;
      if (tabsDetailsMap && tabsDetailsMap.hasOwnProperty(tabId)) {
        const { popupWindowId, isObserving } = tabsDetailsMap[tabId];

        if (isObserving) {
          try {
            await chrome.windows.remove(popupWindowId);
          } catch(e) {
            const isDeleted = delete tabsDetailsMap[tabId];
    
            if (isDeleted) {
              chrome.storage.local.set({ tabsDetailsMap });
            }
          }
        }
      }
    });
  }
};

const clearOnWindowClose = (windowId) => {
  chrome.storage.local.get(['tabsDetailsMap'], async(result) => {
    const { tabsDetailsMap } = result;
    const tabId = Object.keys(tabsDetailsMap).find((tabId) => tabsDetailsMap[tabId].popupWindowId === windowId);

    if (tabId) {
      const isDeleted = delete tabsDetailsMap[tabId];
    
      if (isDeleted) {
        const currentTabId = parseInt(tabId);
        try {
          await chrome.tabs.sendMessage(currentTabId, { action: 'stop-observing' });
        } catch (e) {
          // Uncaught errors may occur since sendMessage is not acknowledged when page navigation is commited because content-script is not injected when navigation is committed.
        }
        await chrome.action.setBadgeText({
          tabId: currentTabId,
          text: 'OFF',
        });
        await chrome.storage.local.set({ tabsDetailsMap });

        // remove listeners when there is no observer enabled
        if (!Object.keys(tabsDetailsMap).length) {
          chrome.webNavigation.onCommitted.removeListener(clearOnNavigation);
          chrome.windows.onRemoved.removeListener(clearOnWindowClose);
        }
      }
    }
  });
}

chrome.runtime.onMessage.addListener(async ({ status }) => {
  if(status === 'observing') {
    const { id: currentTabId } = await getCurrentTab();
    // const popupWindowId = await createPopupWindow();
    const popupWindowId = 100;
    chrome.storage.local.get(['tabsDetailsMap'], async (result) => {
      const { tabsDetailsMap = {}} = result;

      // when the page navigation changes, it won't listen for changes
      // this block will remove the playback window and references related to this tab
      // and reset to original state
      chrome.webNavigation.onCommitted.addListener(clearOnNavigation);

      // when the playbak window is closed directly
      // the references to the tab it was attached will be removed
      // and reset to original state
      chrome.windows.onRemoved.addListener(clearOnWindowClose);

      if (popupWindowId) {
        const updatedTabsDetailsMap = {
          ...tabsDetailsMap,
          [currentTabId]: {
            popupWindowId,
            isObserving: true,
          },
        };

        await chrome.storage.local.set({ tabsDetailsMap: updatedTabsDetailsMap});
        await chrome.action.setBadgeText({
          tabId: currentTabId,
          text: 'ON',
        });
      }
    });
  }
});
