console.log("Background script loaded");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    try {
        if (request.action === "generateSummary") {
            // 确保API密钥已设置
            if (!apiKey) {
                throw new Error("API密钥未设置。请在选项页面设置API密钥。");
            }
            // 执行API调用
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: body
            });
            if (!response.ok) {
                throw new Error(`API调用失败: ${response.statusText}`);
            }
            const data = await response.json();
            // 处理API响应
            if (data.error) {
                sendResponse({ error: data.error.message });
            } else {
                sendResponse({ summary: data.summary, keywords: data.keywords });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        sendResponse({ error: error.message });
    }
    return true;  // 保持消息通道开放
});

function saveToHistory(url, title, summary) {
    chrome.storage.local.get({history: []}, function(result) {
        let history = result.history;
        history.unshift({url: url, title: title, summary: summary, date: new Date().toISOString()});
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        chrome.storage.local.set({history: history});
    });
}

function getHistory(callback) {
    chrome.storage.local.get({history: []}, function(result) {
        callback(result.history);
    });
}