console.log("Background script loaded");

chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked");
  chrome.tabs.sendMessage(tab.id, {action: "getWebsiteInfo"}, (response) => {
    console.log("Response received in background script", response);
    if (chrome.runtime.lastError) {
      console.error("Error in background script:", chrome.runtime.lastError);
      return;
    }
    
    if (response && response.success && response.popupShown) {
      console.log("Popup shown successfully");
      return;
    }
    
    console.log("Popup not shown, consider fallback action");
  });
});