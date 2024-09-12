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
          const options = {
            model: modelSelect.value,
            length: summaryLengthSelect.value
          };

          chrome.runtime.sendMessage({
            action: "generateSummary", 
            content: response.content,
            options: options
          }, (response) => {
            if (response && response.summary) {
              summaryDiv.textContent = response.summary;
            } else {
              summaryDiv.textContent = '生成摘要失败,请重试。';
            }
            generateBtn.disabled = false;
          });
        }
      });
    });
  });
});