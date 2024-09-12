document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save');
    const apiKeyInput = document.getElementById('apiKey');
    const statusDiv = document.getElementById('status');
    const testButton = document.getElementById('test');

    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value;
        chrome.storage.sync.set({apiKey: apiKey}, function() {
            statusDiv.textContent = '选项已保存。';
            setTimeout(function() {
                statusDiv.textContent = '';
            }, 750);
        });
    });

    testButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value;
        if (!apiKey) {
            statusDiv.textContent = '请先输入 API 密钥。';
            return;
        }

        statusDiv.textContent = '正在测试 API 密钥...';
        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{role: "user", content: "Hello"}]
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.choices && data.choices[0] && data.choices[0].message) {
                statusDiv.textContent = 'API 密钥有效。';
            } else {
                statusDiv.textContent = 'API 密钥无效或发生错误。';
            }
        })
        .catch(error => {
            statusDiv.textContent = `测试失败：${error.message}`;
        });
    });

    // 加载保存的选项
    chrome.storage.sync.get(['apiKey'], function(result) {
        apiKeyInput.value = result.apiKey || '';
    });
});