document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save');
    const testButton = document.getElementById('test');
    const statusDiv = document.getElementById('status');
    const modelSelect = document.getElementById('modelSelect');
    const apiSettings = document.getElementById('apiSettings');

    function showApiSettings(model) {
        const settings = apiSettings.getElementsByClassName('api-setting');
        for (let setting of settings) {
            setting.style.display = 'none';
        }
        document.getElementById(`${model}Settings`).style.display = 'block';
    }

    modelSelect.addEventListener('change', function() {
        showApiSettings(this.value);
    });

    function saveOptions() {
        const options = {
            selectedModel: modelSelect.value
        };

        // 保存特定模型的设置
        switch(options.selectedModel) {
            case 'openai':
                options.openaiApiKey = document.getElementById('openaiApiKey').value;
                options.openaiModel = document.getElementById('openaiModel').value;
                break;
            case 'anthropic':
                options.anthropicApiKey = document.getElementById('anthropicApiKey').value;
                break;
            case 'azure':
                options.azureApiKey = document.getElementById('azureApiKey').value;
                options.azureEndpoint = document.getElementById('azureEndpoint').value;
                options.azureDeploymentName = document.getElementById('azureDeploymentName').value;
                break;
            case 'palm':
                options.palmApiKey = document.getElementById('palmApiKey').value;
                break;
            case 'gemini':
                options.geminiApiKey = document.getElementById('geminiApiKey').value;
                options.geminiModel = document.getElementById('geminiModel').value;
                break;
        }

        chrome.storage.sync.set(options, function() {
            statusDiv.textContent = '设置已保存。';
            setTimeout(() => { statusDiv.textContent = ''; }, 2000);
        });
    }

    function loadOptions() {
        chrome.storage.sync.get(null, function(items) {
            if (items.selectedModel) {
                modelSelect.value = items.selectedModel;
                showApiSettings(items.selectedModel);
            }

            // 加载特定模型的设置
            if (items.openaiApiKey) document.getElementById('openaiApiKey').value = items.openaiApiKey;
            if (items.openaiModel) document.getElementById('openaiModel').value = items.openaiModel;
            if (items.anthropicApiKey) document.getElementById('anthropicApiKey').value = items.anthropicApiKey;
            if (items.azureApiKey) document.getElementById('azureApiKey').value = items.azureApiKey;
            if (items.azureEndpoint) document.getElementById('azureEndpoint').value = items.azureEndpoint;
            if (items.azureDeploymentName) document.getElementById('azureDeploymentName').value = items.azureDeploymentName;
            if (items.palmApiKey) document.getElementById('palmApiKey').value = items.palmApiKey;
            if (items.geminiApiKey) document.getElementById('geminiApiKey').value = items.geminiApiKey;
            if (items.geminiModel) document.getElementById('geminiModel').value = items.geminiModel;
        });
    }

    saveButton.addEventListener('click', saveOptions);
    
    async function testApiConnection() {
        const model = modelSelect.value;
        let apiKey, endpoint, body;

        switch(model) {
            case 'openai':
                apiKey = document.getElementById('openaiApiKey').value;
                endpoint = 'https://api.openai.com/v1/chat/completions';
                body = JSON.stringify({
                    model: document.getElementById('openaiModel').value,
                    messages: [
                        {role: "system", content: "你是一个专业的网站分析工具。你的任务是根据提供的URL推断网站的主要内容和目的，而不是分析特定的网页。"},
                        {role: "user", content: "Hello, can you generate a summary for a test website?"}
                    ],
                    max_tokens: 250
                });
                break;
            case 'anthropic':
                apiKey = document.getElementById('anthropicApiKey').value;
                endpoint = 'https://api.anthropic.com/v1/complete';
                body = JSON.stringify({
                    prompt: "Hello, can you generate a summary for a test website?",
                    max_tokens: 250
                });
                break;
            case 'azure':
                apiKey = document.getElementById('azureApiKey').value;
                endpoint = document.getElementById('azureEndpoint').value;
                const deploymentName = document.getElementById('azureDeploymentName').value;
                if (!endpoint || !deploymentName) {
                    statusDiv.textContent = '请填写 Azure 终端地址和部署名称。';
                    return;
                }
                endpoint = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2023-05-15`;
                body = JSON.stringify({
                    messages: [
                        {role: "system", content: "你是一个专业的网站分析工具。你的任务是根据提供的URL推断网站的主要内容和目的，而不是分析特定的网页。"},
                        {role: "user", content: "Hello, can you generate a summary for a test website?"}
                    ],
                    max_tokens: 250
                });
                break;
            case 'palm':
                apiKey = document.getElementById('palmApiKey').value;
                endpoint = 'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText';
                body = JSON.stringify({
                    prompt: "Hello, can you generate a summary for a test website?",
                    max_tokens: 250
                });
                break;
            case 'gemini':
                apiKey = document.getElementById('geminiApiKey').value;
                const modelValue = document.getElementById('geminiModel').value;
                endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelValue}:generateContent?key=${apiKey}`;
                body = JSON.stringify({
                    contents: [{
                        parts: [{
                            text: "Hello, can you generate a summary for a test website?"
                        }]
                    }]
                });
                break;
            default:
                statusDiv.textContent = '未知的模型类型。';
                return;
        }

        if (!apiKey) {
            statusDiv.textContent = '请输入 API 密钥。';
            return;
        }

        statusDiv.textContent = '正在测试 API 连接...';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': model === 'openai' || model === 'anthropic' || model === 'azure' ? `Bearer ${apiKey}` : undefined
                },
                body: body
            });

            if (response.ok) {
                statusDiv.textContent = 'API 连接成功！';
                console.log('API 响应:', await response.json());
            } else {
                const errorData = await response.json();
                statusDiv.textContent = `API 连接失败: ${errorData.error?.message || response.statusText}`;
            }
        } catch (error) {
            statusDiv.textContent = `API 连接错误: ${error.message}`;
        }
    }

    testButton.addEventListener('click', testApiConnection);

    // 加载保存的选项
    loadOptions();
});