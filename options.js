document.addEventListener('DOMContentLoaded', function() {
  const saveButton = document.getElementById('save');
  const testButton = document.getElementById('test');
  const resetButton = document.getElementById('resetCount');
  const apiKeyInput = document.getElementById('apiKey');
  const statusDiv = document.getElementById('status');
  const testResultDiv = document.getElementById('testResult');
  const countSpan = document.getElementById('count');

  saveButton.addEventListener('click', saveApiKey);
  testButton.addEventListener('click', testApiKey);
  resetButton.addEventListener('click', resetCount);

  // 加载保存的设置和使用次数
  chrome.storage.sync.get({
    bingApiKey: '',
    apiUsageCount: 0,
    lastResetDate: null
  }, function(items) {
    apiKeyInput.value = items.bingApiKey;
    updateUsageCount(items.apiUsageCount, items.lastResetDate);
  });

  function saveApiKey() {
    const apiKey = apiKeyInput.value;
    chrome.storage.sync.set({
      bingApiKey: apiKey
    }, function() {
      statusDiv.textContent = '已保存。';
      statusDiv.className = 'success';
      setTimeout(function() {
        statusDiv.textContent = '';
      }, 750);
    });
  }

  function testApiKey() {
    const apiKey = apiKeyInput.value;
    if (!apiKey) {
      testResultDiv.textContent = '请先输入API密钥。';
      testResultDiv.className = 'error';
      return;
    }

    testResultDiv.textContent = '正在测试...';
    testResultDiv.className = '';

    fetch('https://api.bing.microsoft.com/v7.0/search?q=test&count=1', {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('API请求失败');
      }
      return response.json();
    })
    .then(data => {
      testResultDiv.textContent = '连接成功！API密钥有效。';
      testResultDiv.className = 'success';
      // 移除这里的 incrementUsageCount() 调用
    })
    .catch(error => {
      testResultDiv.textContent = '连接失败。请检查您的API密钥是否正确。';
      testResultDiv.className = 'error';
    });
  }

  function incrementUsageCount() {
    chrome.storage.sync.get({
      apiUsageCount: 0,
      lastResetDate: null
    }, function(items) {
      const currentDate = new Date();
      let { apiUsageCount, lastResetDate } = items;

      // 如果是新的一个月，重置计数
      if (!lastResetDate || new Date(lastResetDate).getMonth() !== currentDate.getMonth()) {
        apiUsageCount = 0;
        lastResetDate = currentDate.toISOString();
      }

      apiUsageCount++;

      chrome.storage.sync.set({
        apiUsageCount: apiUsageCount,
        lastResetDate: lastResetDate
      }, function() {
        updateUsageCount(apiUsageCount, lastResetDate);
      });
    });
  }

  function updateUsageCount(count, lastResetDate) {
    countSpan.textContent = count;
    const resetDate = new Date(lastResetDate);
    const nextResetDate = new Date(resetDate.getFullYear(), resetDate.getMonth() + 1, 1);
    countSpan.title = `下次重置日期：${nextResetDate.toLocaleDateString()}`;
  }

  function resetCount() {
    chrome.storage.sync.set({
      apiUsageCount: 0,
      lastResetDate: new Date().toISOString()
    }, function() {
      updateUsageCount(0, new Date().toISOString());
      statusDiv.textContent = '计数已重置。';
      statusDiv.className = 'success';
      setTimeout(function() {
        statusDiv.textContent = '';
      }, 750);
    });
  }
});