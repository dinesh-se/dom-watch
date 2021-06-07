(function() {
  console.log('BG js loaded!');
  const initialState = {
    selectorName: '',
    startDisabled: true,
    stopDisabled: true,
    message: '',
  };
  let tabsDetailsMap = {};

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'get-tab-details') {
      console.log('tab details on request', tabsDetailsMap);
      const tabDetails = tabsDetailsMap[request.tabId];
      
      sendResponse(tabDetails ? tabDetails : initialState);
    } else if (request.action = 'update-tab-details') {
      const { tabDetails } = request;
      const { tabId, ...rest } = tabDetails;

      if(tabsDetailsMap[tabId]) {
        tabsDetailsMap = {
          ...tabsDetailsMap,
          [tabId]: rest,
        }
      } else {
        tabsDetailsMap[tabId] = rest;
      }
    } else if (request.action === 'delete-tab-details') {
      delete tabsDetailsMap[request.tabId];
    };
  });
})();
