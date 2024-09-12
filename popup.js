document.addEventListener('DOMContentLoaded', function() {
    console.log("Popup DOM fully loaded");
    const summarizeBtn = document.getElementById('summarizeBtn');
    const historyBtn = document.getElementById('historyBtn');
    const optionsBtn = document.getElementById('optionsBtn');
    const summaryResult = document.getElementById('summaryResult');
    const historyList = document.getElementById('historyList');
    const summaryLength = document.getElementById('summaryLength');

    if (!summarizeBtn || !historyBtn || !optionsBtn || !summaryResult || !historyList || !summaryLength) {
        console.error("One or more elements not found");
        return;
    }

    summarizeBtn.addEventListener('click', function() {
        console.log("Summarize button clicked");
        summaryResult.classList.remove('hidden');
        historyList.classList.add('hidden');
        summaryResult.innerHTML = '<p>正在分析网站信息...</p>';
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (chrome.runtime.lastError) {
                console.error("Error querying tabs:", chrome.runtime.lastError);
                showError("无法获取当前标签页信息。");
                return;
            }
            console.log("Active tab:", tabs[0]);
            chrome.tabs.sendMessage(tabs[0].id, {action: "getWebsiteInfo"}, function(response) {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message to content script:", chrome.runtime.lastError);
                    showError("无法与内容脚本通信。请刷新页面后重试。");
                    return;
                }
                console.log("Response from content script:", response);

                if (response && response.websiteName) {
                    console.log("Website info received, sending to background for summarization");
                    chrome.runtime.sendMessage({
                        action: "summarizeWebsite", 
                        websiteName: response.websiteName,
                        websiteUrl: response.websiteUrl
                    }, function(response) {
                        if (chrome.runtime.lastError) {
                            console.error("Error sending message to background script:", chrome.runtime.lastError);
                            showError("插件内部错误。请尝试重新加载插件。");
                            return;
                        }
                        console.log("Response from background script:", response);
                        if (response && response.summary) {
                            displaySummary(response);
                        } else if (response && response.error) {
                            showError(response.error);
                        } else {
                            showError("生成摘要时发生未知错误。");
                        }
                    });
                } else {
                    showError("无法获取网站信息。请确保页面已完全加载。");
                }
            });
        });
    });

    historyBtn.addEventListener('click', function() {
        console.log("History button clicked");
        summaryResult.classList.add('hidden');
        historyList.classList.remove('hidden');
        chrome.runtime.sendMessage({action: "getHistory"}, function(response) {
            if (chrome.runtime.lastError) {
                console.error("Error getting history:", chrome.runtime.lastError);
                showError("无法获取历史记录。");
                return;
            }
            if (response && response.history) {
                displayHistory(response.history);
            } else {
                historyList.innerHTML = '<p>无法获取历史记录。</p>';
            }
        });
    });

    optionsBtn.addEventListener('click', function() {
        console.log("Options button clicked");
        chrome.runtime.openOptionsPage();
    });

    function showError(message) {
        console.error("Error:", message);
        summaryResult.innerHTML = `<p style="color: red;">${message}</p>`;
        summaryResult.classList.remove('hidden');
    }

    function displaySummary(data) {
        summaryResult.innerHTML = `
            <div class="summary-item">
                <label>网站名称：</label>
                <div class="input-group">
                    <input type="text" value="${data.websiteName}" readonly>
                    <button class="copyBtn" data-content="${data.websiteName}">复制</button>
                </div>
            </div>
            <div class="summary-item">
                <label>网站 URL：</label>
                <div class="input-group">
                    <input type="text" value="${data.websiteUrl}" readonly>
                    <button class="copyBtn" data-content="${data.websiteUrl}">复制</button>
                </div>
            </div>
            <div class="summary-item">
                <label>网站摘要：</label>
                <div class="input-group">
                    <textarea readonly>${data.summary}</textarea>
                    <button class="copyBtn" data-content="${data.summary}">复制</button>
                </div>
            </div>
            <div class="summary-item">
                <label>关键词：</label>
                <div class="input-group">
                    <input type="text" value="${data.keywords.join(', ')}" readonly>
                    <button class="copyBtn" data-content="${data.keywords.join(', ')}">复制</button>
                </div>
            </div>
        `;

        addCopyButtonListeners();
    }

    function displayHistory(history) {
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = '<p>暂无历史记录</p>';
        } else {
            history.forEach(function(item) {
                const div = document.createElement('div');
                div.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>${item.summary}</p>
                    <a href="${item.url}" target="_blank">查看原页面</a>
                    <hr>
                `;
                historyList.appendChild(div);
            });
        }
    }

    function addCopyButtonListeners() {
        document.querySelectorAll('.copyBtn').forEach(btn => {
            btn.addEventListener('click', function() {
                const content = this.getAttribute('data-content');
                navigator.clipboard.writeText(content).then(() => {
                    const originalText = this.textContent;
                    this.textContent = '已复制';
                    this.style.fontSize = '9px';
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.fontSize = '10px';
                    }, 1000);
                });
            });
        });
    }

    console.log("Event listeners added");
});