document.addEventListener('DOMContentLoaded', function() {
  // 从 URL 参数中获取数据
  const urlParams = new URLSearchParams(window.location.search);
  const websiteName = urlParams.get('name');
  const websiteUrl = urlParams.get('url');
  const websiteDescription = urlParams.get('description');

  // 填充数据
  document.getElementById('websiteName').textContent = websiteName;
  document.getElementById('websiteUrl').textContent = websiteUrl;
  document.getElementById('websiteDescription').textContent = websiteDescription;

  // 复制按钮功能
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const target = this.getAttribute('data-target');
      const text = document.getElementById(target).textContent;
      copyToClipboard(text);
      this.textContent = '已复制';
      setTimeout(() => this.textContent = '复制', 1500);
    });
  });

  // 复制全部按钮功能
  document.getElementById('copyAllBtn').addEventListener('click', function() {
    const allText = `网站名称：${websiteName}\n网站URL：${websiteUrl}\n网站简介：${websiteDescription}`;
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
});