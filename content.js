console.log("Content script loaded");

function getWebsiteInfo() {
  const websiteName = document.querySelector('meta[property="og:site_name"]')?.content || document.title.split(' - ')[0] || new URL(window.location.href).hostname;
  const websiteUrl = new URL(window.location.href).origin;
  
  // 优先获取中文描述
  const websiteDescription = 
    document.querySelector('meta[name="description"][lang="zh"], meta[name="description"][lang="zh-CN"]')?.content ||
    document.querySelector('meta[name="description"]')?.content ||
    "无法获取网站简介";

  return {
    name: websiteName,
    url: websiteUrl,
    description: websiteDescription
  };
}

function showPopup(websiteInfo) {
  console.log("Showing popup", websiteInfo);
  if (document.getElementById('summary-popup')) {
    return;
  }

  // 添加 Font Awesome 样式
  if (!document.querySelector('link[href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
    document.head.appendChild(link);
  }

  const popupHTML = `
    <div id="summary-popup" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); opacity: 0; background: #f0f5f9; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); z-index: 9999; width: 360px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; transition: all 0.3s ease-out; border: 1px solid #e0e0e0;">
      <button id="close-popup" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666666; transition: color 0.3s;">&times;</button>
      <h2 style="margin-top: 0; margin-bottom: 25px; color: #1a5f7a; font-size: 24px; font-weight: 600; text-align: center;">网站摘要</h2>
      <div style="display: flex; flex-direction: column; gap: 20px;">
        ${createInfoCard('网站名称', websiteInfo.name, 'fas fa-globe')}
        ${createInfoCard('网站 URL', websiteInfo.url, 'fas fa-link', true)}
        ${createInfoCard('网站简介', websiteInfo.description, 'fas fa-info-circle')}
      </div>
      <div style="text-align: center; margin-top: 25px;">
        <button id="copy-all" style="background: #1a5f7a; color: white; border: none; padding: 12px 25px; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: 500; transition: all 0.3s; box-shadow: 0 4px 6px rgba(26, 95, 122, 0.11);">复制全部</button>
      </div>
    </div>
  `;
  
  const popupElement = document.createElement('div');
  popupElement.innerHTML = popupHTML;
  document.body.appendChild(popupElement);

  // 添加动画效果
  setTimeout(() => {
    const popup = document.getElementById('summary-popup');
    popup.style.transform = 'translate(-50%, -50%) scale(1)';
    popup.style.opacity = '1';
  }, 50);

  // 添加关闭动画
  function closePopup() {
    const popup = document.getElementById('summary-popup');
    popup.style.transform = 'translate(-50%, -50%) scale(0.9)';
    popup.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(popupElement);
    }, 300);
  }

  document.getElementById('close-popup').addEventListener('click', closePopup);

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const content = e.target.getAttribute('data-content');
      navigator.clipboard.writeText(content).then(() => {
        showCopiedFeedback(e.target);
      }).catch(err => {
        console.error('无法复制文本: ', err);
      });
    });
  });

  document.getElementById('copy-all').addEventListener('click', (e) => {
    const summaryText = `网站名称：${websiteInfo.name}\n网站URL：${websiteInfo.url}\n网站简介：${websiteInfo.description}`;
    navigator.clipboard.writeText(summaryText).then(() => {
      showCopiedFeedback(e.target);
    }).catch(err => {
      console.error('无法复制文本: ', err);
    });
  });
}

function createInfoCard(title, content, iconClass, isUrl = false) {
  const contentHtml = isUrl ? `<a href="${content}" target="_blank" style="color: #1a5f7a; text-decoration: none; word-break: break-all; font-size: 16px;">${content}</a>` : `<span style="word-break: break-word; color: #333333; font-size: 16px;">${content}</span>`;
  
  return `
    <div style="background: #ffffff; border-radius: 12px; padding: 15px; position: relative; transition: all 0.3s; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div style="display: flex; align-items: center;">
          <i class="${iconClass}" style="font-size: 18px; color: #57c5b6; margin-right: 10px;"></i>
          <strong style="color: #1a5f7a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${title}</strong>
        </div>
        <button class="copy-btn" data-content="${content}" style="background: none; border: none; cursor: pointer; padding: 0; transition: all 0.3s;">
          <i class="fas fa-copy" style="font-size: 18px; color: #57c5b6;"></i>
        </button>
      </div>
      <div style="margin-left: 28px;">
        ${contentHtml}
      </div>
    </div>
  `;
}

function showCopiedFeedback(button) {
  const icon = button.querySelector('i');
  const originalClass = icon.className;
  const originalColor = icon.style.color;
  icon.className = 'fas fa-check';
  icon.style.color = '#4caf50'; // 使用绿色表示成功
  setTimeout(() => {
    icon.className = originalClass;
    icon.style.color = originalColor;
  }, 1500);
}

// 更新全局样式
const style = document.createElement('style');
style.textContent = `
  #summary-popup > div > div:hover {
    box-shadow: 0 7px 14px rgba(0, 0, 0, 0.1);
  }
  #summary-popup #close-popup:hover {
    color: #f44336;
  }
  #summary-popup #copy-all:hover {
    background: #57c5b6;
    box-shadow: 0 7px 14px rgba(87, 197, 182, 0.2);
  }
  #summary-popup .copy-btn:hover i {
    color: #1a5f7a;
  }
`;
document.head.appendChild(style);

// 修改消息监听器
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script", request);
  if (request.action === "getWebsiteInfo") {
    const websiteInfo = getWebsiteInfo();
    showPopup(websiteInfo);
    console.log("Sending response from content script", {success: true, popupShown: true});
    sendResponse({success: true, popupShown: true});
    return true; // 保持消息通道开放
  }
});