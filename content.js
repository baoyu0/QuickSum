console.log("QuickSum content script loaded");

function getWebsiteInfo() {
    const url = new URL(window.location.href);
    const hostname = url.hostname;
    
    // 从 URL 推断网站名称
    let websiteName = hostname.split('.').slice(-2, -1)[0];
    websiteName = websiteName.charAt(0).toUpperCase() + websiteName.slice(1);

    // 如果存在 og:site_name，优先使用
    const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.content;
    if (ogSiteName) {
        websiteName = ogSiteName;
    }

    const websiteUrl = url.origin;

    return {
        websiteName,
        websiteUrl,
        hostname
    };
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Message received in content script:", request);
    if (request.action === "getWebsiteInfo") {
        console.log("Attempting to get website info");
        const websiteInfo = getWebsiteInfo();
        console.log("Website info extracted:", websiteInfo);
        sendResponse(websiteInfo);
    }
    return true;  // 保持消息通道开放
});

console.log("QuickSum content script fully loaded and initialized");