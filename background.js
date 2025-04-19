// 存储配置
let config = {
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  scenarios: []
};

// 加载保存的配置
chrome.storage.sync.get(['translatorConfig'], (result) => {
  if (result.translatorConfig) {
    config = result.translatorConfig;
  }
});

// 保存配置
function saveConfig() {
  chrome.storage.sync.set({ translatorConfig: config });
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
