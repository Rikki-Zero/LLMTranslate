// 存储配置
let config = {
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  scenarios: []
};

// 调试存储状态
function debugStorage() {
  chrome.storage.local.get(null, (items) => {
    if (chrome.runtime.lastError) {
      console.error('存储读取错误:', chrome.runtime.lastError);
    } else {
      console.log('当前存储内容:', items);
    }
  });
}

// 加载保存的配置
chrome.storage.local.get(['translatorConfig'], (result) => {
  if (chrome.runtime.lastError) {
    console.error('配置加载错误:', chrome.runtime.lastError);
    return;
  }
  
  console.log('加载配置结果:', result);
  if (result && result.translatorConfig) {
    config = result.translatorConfig;
    console.log('已加载配置:', config);
  } else {
    // 初始化默认配置
    config = {
      apiEndpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: '',
      scenarios: []
    };
    chrome.storage.local.set({ translatorConfig: config }, () => {
      if (chrome.runtime.lastError) {
        console.error('配置保存错误:', chrome.runtime.lastError);
      } else {
        console.log('默认配置已保存');
        debugStorage();
      }
    });
  }
});

// 每5分钟检查一次存储状态
setInterval(debugStorage, 5 * 60 * 1000);

// 保存配置
function saveConfig() {
  chrome.storage.local.set({ translatorConfig: config }, () => {
    if (chrome.runtime.lastError) {
      console.error('配置保存错误:', chrome.runtime.lastError);
    } else {
      console.log('配置已保存:', config);
      debugStorage();
    }
  });
}

// 处理API请求
async function callOpenAI(prompt, model, systemMessage) {
  try {
    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });
    return await response.json();
  } catch (error) {
    console.error('API请求失败:', error);
    return null;
  }
}

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    const scenario = config.scenarios.find(s => s.id === request.scenarioId);
    if (scenario) {
      callOpenAI(request.text, scenario.model, scenario.prompt)
        .then(response => {
          sendResponse({ 
            success: true,
            result: response?.choices?.[0]?.message?.content || '翻译失败'
          });
        });
      return true; // 保持消息通道开放
    }
  }
  return false;
});
