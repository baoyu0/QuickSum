console.log("Background script loaded");

const BING_SEARCH_API_KEY = 'fa663cf1-bbf4-4d19-a597-91fdb4f1f821';
const BING_SEARCH_ENDPOINT = 'https://api.bing.microsoft.com/bing/v7.0/search';

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getBingWebSearch") {
    getWebsiteInfo(request.url)
      .then(data => sendResponse(data))
      .catch(error => {
        console.error('Error:', error);
        sendResponse({error: 'Failed to fetch data from Bing API'});
      });

    return true; // 保持消息通道开放
  }
});

async function getWebsiteInfo(url) {
  try {
    const searchResult = await fetchBingSearch(url);
    if (searchResult && searchResult.webPages && searchResult.webPages.value.length > 0) {
      const websiteInfo = searchResult.webPages.value[0];
      return {
        name: websiteInfo.name,
        url: url,
        description: websiteInfo.snippet
      };
    }
  } catch (error) {
    console.error('Error fetching from Bing API:', error);
  }

  // 如果API调用失败，返回一个错误对象
  return { error: '无法获取网站信息' };
}

async function fetchBingSearch(url) {
  const params = new URLSearchParams({
    'q': url,  // 直接使用完整的URL作为搜索查询
    'mkt': 'zh-CN'  // 使用中文市场
  });

  const response = await fetch(`${BING_SEARCH_ENDPOINT}?${params}`, {
    headers: {
      'Ocp-Apim-Subscription-Key': BING_SEARCH_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}