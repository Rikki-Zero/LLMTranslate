interface TranslatorConfig {
  apiEndpoint: string;
  apiKey: string;
  scenarios: Array<{
    id: string;
    name: string;
    model: string;
    prompt: string;
  }>;
}

let saveTimer: number | null = null;

// 加载配置
function loadConfig(): Promise<TranslatorConfig> {
  return new Promise((resolve, reject) => {
    browser.storage.local.get(['translatorConfig']).then(result => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
        return;
      }

      if (result.translatorConfig) {
        resolve(result.translatorConfig);
      } else {
        const defaultConfig: TranslatorConfig = {
          apiEndpoint: 'https://api.openai.com/v1/chat/completions',
          apiKey: '',
          scenarios: []
        };
        browser.storage.local.set({ translatorConfig: defaultConfig })
          .then(() => resolve(defaultConfig))
          .catch(reject);
      }
    }).catch(reject);
  });
}

// 更新UI显示配置
function updateUIWithConfig(config: TranslatorConfig) {
  const endpointEl = document.getElementById('apiEndpoint') as HTMLInputElement;
  const keyEl = document.getElementById('apiKey') as HTMLInputElement;
  const container = document.getElementById('scenariosContainer');

  if (endpointEl && keyEl) {
    endpointEl.value = config.apiEndpoint;
    endpointEl.placeholder = 'https://api.openai.com/v1/chat/completions';
    
    keyEl.value = config.apiKey;
    keyEl.placeholder = '输入你的OpenAI API密钥';
  }

  if (container) {
    container.innerHTML = '';
    config.scenarios.forEach(scenario => {
      const el = document.createElement('div');
      el.className = 'scenario-item';
      el.dataset.id = scenario.id;
      el.innerHTML = `
        <input type="text" class="scenario-name" value="${scenario.name}" placeholder="场景名称">
        <input type="text" class="scenario-model" value="${scenario.model}" placeholder="模型名称">
        <textarea class="scenario-prompt">${scenario.prompt}</textarea>
        <button class="remove-scenario">删除</button>
      `;
      container.appendChild(el);
    });
  }
}

// 保存配置
function saveConfig(config: TranslatorConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    browser.storage.local.set({ translatorConfig: config })
      .then(() => {
        const endpointEl = document.getElementById('apiEndpoint') as HTMLInputElement;
        const keyEl = document.getElementById('apiKey') as HTMLInputElement;
        
        if (endpointEl && keyEl) {
          endpointEl.value = config.apiEndpoint;
          keyEl.value = config.apiKey;
        }
        resolve();
      })
      .catch(reject);
  });
}

// 显示状态信息
function showStatus(elementId: string, message: string) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    setTimeout(() => el.textContent = '', 2000);
  }
}

// 添加场景到UI
function addScenarioToUI(scenario: {id: string, name: string, model: string, prompt: string}) {
  const container = document.getElementById('scenariosContainer');
  if (!container) return;

  const el = document.createElement('div');
  el.className = 'scenario-item';
  el.dataset.id = scenario.id;
  el.innerHTML = `
    <input type="text" class="scenario-name" value="${scenario.name}" placeholder="场景名称">
    <input type="text" class="scenario-model" value="${scenario.model}" placeholder="模型名称">
    <textarea class="scenario-prompt">${scenario.prompt}</textarea>
    <button class="remove-scenario">删除</button>
  `;
  container.appendChild(el);
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  const endpointEl = document.getElementById('apiEndpoint') as HTMLInputElement;
  const keyEl = document.getElementById('apiKey') as HTMLInputElement;
  
  if (endpointEl && keyEl) {
    endpointEl.placeholder = 'https://api.openai.com/v1/chat/completions';
    keyEl.placeholder = '输入你的OpenAI API密钥';

    try {
      const config = await loadConfig();
      updateUIWithConfig(config);
    } catch (error) {
      console.error('配置加载失败:', error);
    }

    // 输入监听
    endpointEl.addEventListener('input', () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = window.setTimeout(async () => {
        try {
          await saveConfig({
            apiEndpoint: endpointEl.value,
            apiKey: keyEl.value,
            scenarios: []
          });
          showStatus('apiStatus', '保存成功');
        } catch (error) {
          showStatus('apiStatus', '保存失败');
        }
      }, 500);
    });

    keyEl.addEventListener('input', () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = window.setTimeout(async () => {
        try {
          await saveConfig({
            apiEndpoint: endpointEl.value,
            apiKey: keyEl.value,
            scenarios: []
          });
          showStatus('apiStatus', '保存成功');
        } catch (error) {
          showStatus('apiStatus', '保存失败');
        }
      }, 500);
    });
  }

  // 添加场景按钮
  document.getElementById('addScenario')?.addEventListener('click', () => {
    addScenarioToUI({
      id: Date.now().toString(),
      name: '',
      model: 'gpt-3.5-turbo',
      prompt: '你是一个翻译助手，请将以下内容翻译成中文：'
    });
  });
});
