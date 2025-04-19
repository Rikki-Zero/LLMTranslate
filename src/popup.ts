interface Scenario {
  id: string;
  name: string;
  model: string;
  prompt: string;
}

document.addEventListener('DOMContentLoaded', async () => {
  const scenarioSelect = document.getElementById('scenarioSelect') as HTMLSelectElement;
  const saveTrigger = document.getElementById('saveTrigger') as HTMLButtonElement;
  const triggerInputs = document.querySelectorAll<HTMLInputElement>('input[name="trigger"]');

  // 加载配置
  const { scenarios = [], triggerMode = 'hover' } = await browser.storage.local.get([
    'scenarios', 
    'triggerMode'
  ]);

  // 填充场景选择
  scenarioSelect.innerHTML = '';
  if (scenarios.length === 0) {
    scenarioSelect.innerHTML = '<option value="">请先在选项中添加场景</option>';
  } else {
    scenarios.forEach((scenario: Scenario) => {
      const option = document.createElement('option');
      option.value = scenario.id;
      option.textContent = scenario.name;
      scenarioSelect.appendChild(option);
    });
  }

  // 设置当前触发模式
  triggerInputs.forEach(input => {
    if (input.value === triggerMode) {
      input.checked = true;
    }
  });

  // 保存配置
  saveTrigger.addEventListener('click', () => {
    const selectedTrigger = document.querySelector<HTMLInputElement>(
      'input[name="trigger"]:checked'
    )?.value || 'hover';
    
    browser.storage.local.set({ 
      triggerMode: selectedTrigger,
      selectedScenarioId: scenarioSelect.value
    });
  });
});
