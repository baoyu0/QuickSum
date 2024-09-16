document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const modelSelect = document.getElementById('modelSelect');
  const summaryLengthSelect = document.getElementById('summaryLengthSelect');
  const summaryDiv = document.getElementById('summary');

  // 加载保存的设置
  chrome.storage.sync.get(['selectedModel', 'summaryLength'], (result) => {
    if (result.selectedModel) modelSelect.value = result.selectedModel;
    if (result.summaryLength) summaryLengthSelect.value = result.summaryLength;
  });

  // 保存设置
  modelSelect.addEventListener('change', () => {
    chrome.storage.sync.set({selectedModel: modelSelect.value});
  });

  summaryLengthSelect.addEventListener('change', () => {
    chrome.storage.sync.set({summaryLength: summaryLengthSelect.value});
  });

  generateBtn.addEventListener('click', () => {
    generateBtn.disabled = true;
    summaryDiv.textContent = '正在生成摘要...';

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: "getPageContent"}, (response) => {
        if (response && response.content) {
          chrome.runtime.sendMessage({
            action: "generateSummary",
            content: response.content
          }, (response) => {
            if (response.error) {
              summaryDiv.textContent = `错误: ${response.error}`;
            } else {
              summaryDiv.textContent = response.summary || '无法生成摘要。';
            }
            generateBtn.disabled = false;
          });
        } else {
          summaryDiv.textContent = '无法获取网页内容。';
          generateBtn.disabled = false;
        }
      });
    });
  });
});