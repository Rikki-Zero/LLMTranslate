// 创建悬浮窗元素
const floatingPanel = document.createElement('div');
floatingPanel.style.position = 'fixed';
floatingPanel.style.zIndex = '9999';
floatingPanel.style.backgroundColor = 'white';
floatingPanel.style.border = '1px solid #ccc';
floatingPanel.style.borderRadius = '4px';
floatingPanel.style.padding = '8px';
floatingPanel.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
floatingPanel.style.display = 'none';
document.body.appendChild(floatingPanel);

// 创建悬浮按钮
const floatingButton = document.createElement('div');
floatingButton.textContent = '翻译';
floatingButton.style.position = 'absolute';
floatingButton.style.zIndex = '10000';
floatingButton.style.backgroundColor = '#4CAF50';
floatingButton.style.color = 'white';
floatingButton.style.padding = '4px 8px';
floatingButton.style.borderRadius = '4px';
floatingButton.style.cursor = 'pointer';
floatingButton.style.display = 'none';
document.body.appendChild(floatingButton);

let selectedText = '';
let selectionRect = null;

// 显示悬浮按钮
function showFloatingButton(rect) {
  floatingButton.style.display = 'block';
  floatingButton.style.left = `${rect.right + window.scrollX}px`;
  floatingButton.style.top = `${rect.top + window.scrollY}px`;
}

// 隐藏悬浮元素
function hideFloatingElements() {
  floatingButton.style.display = 'none';
  floatingPanel.style.display = 'none';
}

// 加载触发模式
let triggerMode = 'hover';
chrome.storage.sync.get(['triggerMode'], (result) => {
  triggerMode = result.triggerMode || 'hover';
});

// 处理文本选择
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    hideFloatingElements();
    return;
  }

  selectedText = selection.toString().trim();
  if (!selectedText) return;

  selectionRect = selection.getRangeAt(0).getBoundingClientRect();
  
  if (triggerMode === 'hover') {
    showFloatingButton(selectionRect);
  } else if (triggerMode === 'auto') {
    chrome.runtime.sendMessage({
      action: 'translate',
      text: selectedText,
      scenarioId: 'default' // 使用默认场景或第一个场景
    }, (response) => {
      if (response?.success) {
        floatingPanel.textContent = response.result;
        floatingPanel.style.display = 'block';
        floatingPanel.style.left = `${selectionRect.left + window.scrollX}px`;
        floatingPanel.style.top = `${selectionRect.bottom + window.scrollY + 5}px`;
      }
    });
  }
});

// 点击悬浮按钮处理
floatingButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    action: 'translate',
    text: selectedText,
    scenarioId: 'default' // 暂时使用默认场景
  }, (response) => {
    if (response?.success) {
      floatingPanel.textContent = response.result;
      floatingPanel.style.display = 'block';
      floatingPanel.style.left = `${selectionRect.left + window.scrollX}px`;
      floatingPanel.style.top = `${selectionRect.bottom + window.scrollY + 5}px`;
    }
  });
});

// 点击页面其他地方隐藏悬浮元素
document.addEventListener('click', (e) => {
  if (e.target !== floatingButton && e.target !== floatingPanel) {
    hideFloatingElements();
  }
});
