function getWebsiteInfo() {
  const websiteName = document.querySelector('meta[property="og:site_name"]')?.content || document.title.split(' - ')[0] || new URL(window.location.href).hostname;
  const websiteUrl = new URL(window.location.href).origin;
  
  // 优先获取中文描述
  const websiteDescription = 
    document.querySelector('meta[name="description"][lang="zh"], meta[name="description"][lang="zh-CN"]')?.content ||
    document.querySelector('meta[name="description"]')?.content ||
    "无法获取网站简介";

  return {
    name: websiteName,
    url: websiteUrl,
    description: websiteDescription
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getWebsiteInfo") {
    sendResponse(getWebsiteInfo());
  }
});