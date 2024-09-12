console.log("Background script loaded");

let API_KEY = '';

chrome.storage.sync.get(['apiKey'], function(result) {
    API_KEY = result.apiKey;
    console.log("API Key loaded:", API_KEY ? "Yes" : "No");
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Message received in background:", request);
    if (request.action === "summarizeWebsite") {
        if (!API_KEY) {
            sendResponse({error: "API密钥未设置。请在选项页面设置API密钥。"});
            return true;
        }
        
        const API_URL = 'https://api.openai.com/v1/chat/completions';
        
        const prompt = `请根据以下网站URL生成一个简短的网站摘要和5个关键词：
        网站名称：${request.websiteName}
        网站URL：${request.websiteUrl}
        
        请注意，你需要根据网站URL来推断网站的主要内容和目的，而不是分析特定的网页内容。
        
        请返回结果，格式如下：
        摘要：[这里是网站摘要，请确保摘要准确反映网站的主要内容和目的]
        关键词：关键词1, 关键词2, 关键词3, 关键词4, 关键词5`;

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {role: "system", content: "你是一个专业的网站分析工具。你的任务是根据提供的URL推断网站的主要内容和目的，而不是分析特定的网页。"},
                    {role: "user", content: prompt}
                ],
                max_tokens: 250
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("API response:", data);
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const content = data.choices[0].message.content;
                const summaryMatch = content.match(/摘要：([\s\S]*?)(?=\n关键词：|$)/);
                const keywordsMatch = content.match(/关键词：(.*)/);
                
                const summary = summaryMatch ? summaryMatch[1].trim() : "无法生成摘要";
                const keywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [];

                sendResponse({
                    websiteName: request.websiteName,
                    websiteUrl: request.websiteUrl,
                    summary: summary,
                    keywords: keywords
                });
            } else {
                throw new Error("Unexpected API response structure");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            sendResponse({error: `发生错误：${error.message}。请检查您的网络连接和API密钥。`});
        });
        
        return true;  // 保持消息通道开放
    } else if (request.action === "getHistory") {
        getHistory(function(history) {
            sendResponse({history: history});
        });
        return true;  // 保持消息通道开放
    }
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