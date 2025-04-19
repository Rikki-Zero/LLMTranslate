// 配置自动保存计时器
let saveTimer = null;
const SAVE_DELAY = 1000; // 1秒延迟保存

// 显示加载状态
function showLoading() {
    document.getElementById('apiEndpoint').placeholder = '加载中...';
    document.getElementById('apiKey').placeholder = '加载中...';
}

// 加载配置
function loadConfig() {
    chrome.storage.sync.get(['translatorConfig'], (result) => {
        if (!result || !result.translatorConfig) {
            // 初始化默认配置
            const defaultConfig = {
                apiEndpoint: 'https://api.openai.com/v1/chat/completions',
                apiKey: '',
                scenarios: []
            };
            chrome.storage.sync.set({ translatorConfig: defaultConfig }, () => {
                updateUIWithConfig(defaultConfig);
            });
            return;
        }

        showLoading();
        updateUIWithConfig(result.translatorConfig);
    });
}

// 使用配置更新UI
function updateUIWithConfig(config) {
    try {
        // 填充API配置
        const endpointEl = document.getElementById('apiEndpoint');
        const keyEl = document.getElementById('apiKey');

        endpointEl.value = config.apiEndpoint;
        endpointEl.placeholder = 'https://api.openai.com/v1/chat/completions';

        keyEl.value = config.apiKey;
        keyEl.placeholder = '输入你的OpenAI API密钥';

        // 确保加载完成后状态正确
        if (!config.apiEndpoint) {
            endpointEl.placeholder = 'https://api.openai.com/v1/chat/completions';
        }
        if (!config.apiKey) {
            keyEl.placeholder = '输入你的OpenAI API密钥';
        }

        // 填充场景组
        const container = document.getElementById('scenariosContainer');
        container.innerHTML = '';
        config.scenarios.forEach(scenario => {
            addScenarioToUI(scenario);
        });
    } catch (error) {
        console.error('配置加载错误:', error);
        // 恢复默认placeholder
        document.getElementById('apiEndpoint').placeholder = 'https://api.openai.com/v1/chat/completions';
        document.getElementById('apiKey').placeholder = '输入你的OpenAI API密钥';
    }
}

// 保存配置
function saveConfig() {
    clearTimeout(saveTimer);

    const config = {
        apiEndpoint: document.getElementById('apiEndpoint').value,
        apiKey: document.getElementById('apiKey').value,
        scenarios: []
    };

    // 收集场景组
    document.querySelectorAll('.scenario').forEach(el => {
        config.scenarios.push({
            id: el.dataset.id,
            name: el.querySelector('.scenario-name').value,
            model: el.querySelector('.scenario-model').value,
            prompt: el.querySelector('.scenario-prompt').value
        });
    });

    // 保存到存储
    chrome.storage.sync.set({ translatorConfig: config }, () => {
        showStatus('apiStatus', '配置已保存');
        // 更新字段显示已保存的值
        document.getElementById('apiEndpoint').value = config.apiEndpoint;
        document.getElementById('apiKey').value = config.apiKey;
    });
}

// 显示状态信息
function showStatus(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    setTimeout(() => el.textContent = '', 2000);
}

// 添加场景到UI
function addScenarioToUI(scenario) {
    const el = document.createElement('div');
    el.className = 'scenario';
    el.dataset.id = scenario.id || Date.now().toString();

    el.innerHTML = `
    <label>场景名称</label>
    <input type="text" class="scenario-name" value="${scenario.name || '新场景'}">
    
    <label>模型</label>
    <select class="scenario-model">
      <option value="gpt-3.5-turbo" ${scenario.model === 'gpt-3.5-turbo' ? 'selected' : ''}>GPT-3.5 Turbo</option>
      <option value="gpt-4" ${scenario.model === 'gpt-4' ? 'selected' : ''}>GPT-4</option>
    </select>
    
    <label>提示词</label>
    <textarea class="scenario-prompt" rows="3">${scenario.prompt || '请翻译以下内容:'}</textarea>
    
    <button class="remove-scenario">删除</button>
  `;

    // 添加事件监听
    el.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', () => {
            showStatus('scenarioStatus', '修改已保存');
            saveConfig();
        });
    });

    el.querySelector('.remove-scenario').addEventListener('click', () => {
        el.remove();
        saveConfig();
    });

    document.getElementById('scenariosContainer').appendChild(el);
}

// 显示加载状态
function showLoading() {
    document.getElementById('apiEndpoint').placeholder = '加载中...';
    document.getElementById('apiKey').placeholder = '加载中...';
}

// 确保元素存在
function ensureElements() {
    const elements = [
        'apiEndpoint',
        'apiKey',
        'scenariosContainer',
        'addScenario'
    ];
    elements.forEach(id => {
        if (!document.getElementById(id)) {
            throw new Error(`元素 ${id} 未找到`);
        }
    });
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    try {
        ensureElements();
        // 直接加载配置，由loadConfig决定是否显示加载状态
        loadConfig();
    } catch (error) {
        console.error('初始化错误:', error);
        // 恢复默认placeholder
        document.getElementById('apiEndpoint').placeholder = 'https://api.openai.com/v1/chat/completions';
        document.getElementById('apiKey').placeholder = '输入你的OpenAI API密钥';
    }

    // API配置自动保存
    document.getElementById('apiEndpoint').addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            showStatus('apiStatus', '端点已保存');
            saveConfig();
        }, SAVE_DELAY);
    });

    document.getElementById('apiKey').addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            showStatus('apiStatus', '密钥已保存');
            saveConfig();
        }, SAVE_DELAY);
    });

    // 添加场景按钮
    document.getElementById('addScenario').addEventListener('click', () => {
        addScenarioToUI({});
        showStatus('scenarioStatus', '场景已添加');
        saveConfig();
    });
});
