/**
 * Tab cache entries
 */
const tabCache = new Map();

(async function () {
  // Chrome tabs event listener
  chrome.tabs.onCreated.addListener(function onTabsCreated(tab) {
    if (tab.id && tab.url) {
      // Update the chrome tab in the cache
      tabCache.set(tab.id, 0);
    }
  });

  // Chrome tabs event listener
  chrome.tabs.onUpdated.addListener(function onTabsUpdated(
    tabId,
    changeInfo,
    tab
  ) {
    if (tab.id && tab.url) {
      // Determine whether the tab is reloading
      if (changeInfo.status && changeInfo.status === 'loading') {
        // Update the chrome tab in the cache
        tabCache.set(tab.id, 0);

        // Reset the chrome tab badge
        chrome.action.setBadgeText({ tabId: tab.id, text: '' });
      }
    }
  });

  // Chrome tabs event listener
  chrome.tabs.onRemoved.addListener(function onTabsRemoved(tabId) {
    // Delete the chrome tab from the cache
    tabCache.delete(tabId);
  });

  // Initialize the tab cache
  await new Promise((resolve) => {
    // Query all chrome tabs
    chrome.tabs.query({}, (tabs) => {
      tabs
        .filter((tab) => tab.id && tab.url && !tabCache.has(tab.id))
        .forEach((tab) => {
          // Update the chrome tab in the cache
          tabCache.set(tab.id, 0);
        });

      resolve();
    });
  });

  chrome.runtime.onMessage.addListener((_, { tab }, sendResponse) => {
    let tabCounter = tabCache.get(tab.id);
    tabCounter++;

    // Update the chrome tab in the cache
    tabCache.set(tab.id, tabCounter);

    // Update the chrome tab badge
    chrome.action.setBadgeText({
      tabId: tab.id,
      text:
        tabCounter > 999 ? '999+' : tabCounter.toString()
    });

    sendResponse();
  });
})().catch((error) => {
  console.error(error);
});
