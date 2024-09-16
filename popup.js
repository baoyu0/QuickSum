document.addEventListener('DOMContentLoaded', function() {
  const summarizeBtn = document.getElementById('summarizeBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const copyAllBtn = document.getElementById('copyAllBtn');
  const modal = document.getElementById('summaryModal');
  const closeBtn = document.querySelector('.close');

  summarizeBtn.addEventListener('click', summarizePage);
  settingsBtn.addEventListener('click', openSettings);
  closeBtn.addEventListener('click', closeModal);
  window.addEventListener('click', outsideClick);

  function summarizePage() {
    // 显示加载动画
    summarizeBtn.querySelector('.loader').style.display = 'block';
    summarizeBtn.querySelector('.button-text').style.opacity = '0';

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "getWebsiteInfo"}, function(response) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          displayError("无法获取网页信息，请刷新页面后重试。");
          return;
        }
        if (response && response.name && response.description) {
          displaySummary(response);
        } else {
          fetchSearchResults(tabs[0].url);
        }
      });
    });
  }

  function openSettings() {
    chrome.runtime.openOptionsPage();
  }

  function displaySummary(info) {
    const summaryUrl = chrome.extension.getURL('summary.html') +
      `?name=${encodeURIComponent(info.name)}` +
      `&url=${encodeURIComponent(info.url)}` +
      `&description=${encodeURIComponent(info.description)}`;
    
    chrome.tabs.create({ url: summaryUrl });

    // 隐藏加载动画，恢复按钮文字
    summarizeBtn.querySelector('.loader').style.display = 'none';
    summarizeBtn.querySelector('.button-text').style.opacity = '1';
  }

  function adjustModalPosition() {
    const modalContent = document.querySelector('.modal-content');
    const windowHeight = window.innerHeight;
    const modalHeight = modalContent.offsetHeight;

    if (modalHeight > windowHeight * 0.9) {
      modalContent.style.margin = '5% auto';
    } else {
      const topMargin = Math.max((windowHeight - modalHeight) / 2, windowHeight * 0.05);
      modalContent.style.margin = `${topMargin}px auto`;
    }
  }

  function displayError(message) {
    // 在模态框中显示错误信息
    document.getElementById('summary').innerHTML = `<p class="error">${message}</p>`;
    modal.style.display = 'block';
    
    // 隐藏加载动画，恢复按钮文字
    summarizeBtn.querySelector('.loader').style.display = 'none';
    summarizeBtn.querySelector('.button-text').style.opacity = '1';
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  function outsideClick(e) {
    if (e.target == modal) {
      modal.style.display = 'none';
    }
  }

  function fetchSearchResults(url) {
    const domain = new URL(url).hostname;
    chrome.storage.sync.get({
      bingApiKey: ''
    }, function(items) {
      if (!items.bingApiKey) {
        displayError("请先在设置页面配置Bing Web Search API密钥。");
        chrome.runtime.openOptionsPage(); // 打开设置页面
        return;
      }

      // 添加 mkt 参数来指定中文结果，cc 参数指定中国地区
      fetch(`https://api.bing.microsoft.com/v7.0/search?q=${domain}&count=1&mkt=zh-CN&cc=CN`, {
        headers: {
          'Ocp-Apim-Subscription-Key': items.bingApiKey
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.webPages && data.webPages.value.length > 0) {
          const result = data.webPages.value[0];
          let description = result.snippet;

          // 如果有中文描述，优先使用中文描述
          if (result.description) {
            description = result.description;
          }

          displaySummary({
            name: result.name,
            url: result.url,
            description: description
          });
          incrementUsageCount(); // 只在成功获取网站信息时增加计数
        } else {
          displayError("无法获取网站信息。");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        displayError("获取网站信息时发生错误。请检查您的API密钥是否正确。");
      });
    });
  }

  // 添加复制按钮功能
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const target = this.getAttribute('data-target');
      const text = document.getElementById(target).textContent;
      copyToClipboard(text);
      this.textContent = '已复制';
      setTimeout(() => this.textContent = '复制', 1500);
    });
  });

  // 添加复制全部按钮功能
  document.getElementById('copyAllBtn').addEventListener('click', function() {
    const name = document.getElementById('websiteName').textContent;
    const url = document.getElementById('websiteUrl').textContent;
    const description = document.getElementById('websiteDescription').textContent;
    const allText = `网站名称：${name}\n网站URL：${url}\n网站简介：${description}`;
    copyToClipboard(allText);
    this.textContent = '已复制全部';
    setTimeout(() => this.textContent = '复制全部', 1500);
  });

  function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  function incrementUsageCount() {
    chrome.storage.sync.get({
      apiUsageCount: 0,
      lastResetDate: null
    }, function(items) {
      const currentDate = new Date();
      let { apiUsageCount, lastResetDate } = items;

      if (!lastResetDate || new Date(lastResetDate).getMonth() !== currentDate.getMonth()) {
        apiUsageCount = 0;
        lastResetDate = currentDate.toISOString();
      }

      apiUsageCount++;

      chrome.storage.sync.set({
        apiUsageCount: apiUsageCount,
        lastResetDate: lastResetDate
      });
    });
  }

  // 添加窗口大小改变事件监听器
  window.addEventListener('resize', adjustModalPosition);
});