/**
 * @file public/js/admin/model-config.js
 * @description Admin model/provider/plan model selectors and dynamic plan-model rows.
 */
(function () {
  'use strict';

  function filterOptionsByProvider(providerSelect, modelSelect) {
    if (!providerSelect || !modelSelect) return;
    const providerId = String(providerSelect.value || '');
    let selectedVisible = false;
    Array.from(modelSelect.options).forEach((option) => {
      const optionProviderId = String(option.dataset.providerId || '');
      const visible = !option.value || optionProviderId === providerId;
      option.hidden = !visible;
      option.disabled = !visible;
      if (option.selected && visible) selectedVisible = true;
    });
    if (!selectedVisible) modelSelect.value = '';
  }

  function setupPlanModelRow(row) {
    if (!row || row.dataset.planModelInitialized === '1') return;
    row.dataset.planModelInitialized = '1';
    const providerSelect = row.querySelector('[data-plan-model-provider]');
    const modelSelect = row.querySelector('[data-plan-model-select]');
    const presetSelect = row.querySelector('[data-plan-model-preset]');
    const keyInput = row.querySelector('[data-plan-model-key]');
    const defaultInput = row.querySelector('[data-plan-model-default]');

    function applyPresetPreview() {
      if (!presetSelect) return;
      const option = presetSelect.selectedOptions?.[0];
      const name = option?.dataset.modelLabel || option?.textContent || '未选择模型';
      const description = option?.dataset.modelDescription || '暂无描述';
      const previewName = row.querySelector('[data-plan-model-preview-name]');
      const previewDesc = row.querySelector('[data-plan-model-preview-desc]');
      if (previewName) previewName.textContent = name;
      if (previewDesc) previewDesc.textContent = description;
      if (defaultInput) defaultInput.value = presetSelect.value || '';
    }

    const syncDefaultValue = () => {
      if (defaultInput && keyInput) defaultInput.value = keyInput.value || '';
    };

    providerSelect?.addEventListener('change', () => filterOptionsByProvider(providerSelect, modelSelect));
    presetSelect?.addEventListener('change', applyPresetPreview);
    keyInput?.addEventListener('input', syncDefaultValue);

    row.querySelector('[data-plan-model-remove]')?.addEventListener('click', () => {
      const list = row.closest('[data-plan-model-list]');
      if (list && list.querySelectorAll('.plan-model-row').length <= 1) {
        row.querySelectorAll('input, select').forEach((field) => {
          if (field.type === 'radio') field.checked = true;
          else if (field.name === 'planModelRequestMultiplier' || field.name === 'planModelTokenMultiplier') field.value = '1';
          else if (field.tagName === 'SELECT') field.selectedIndex = field.querySelector('option[value]:not([value=""])') ? Array.from(field.options).findIndex((option) => option.value) : 0;
          else field.value = '';
        });
        syncDefaultValue();
        filterOptionsByProvider(providerSelect, modelSelect);
        applyPresetPreview();
        return;
      }
      const wasDefault = Boolean(defaultInput?.checked);
      row.remove();
      if (wasDefault && list) {
        const firstDefault = list.querySelector('[data-plan-model-default]');
        if (firstDefault) firstDefault.checked = true;
      }
    });

    filterOptionsByProvider(providerSelect, modelSelect);
    applyPresetPreview();
    syncDefaultValue();
  }

  document.querySelectorAll('[data-billing-mode]').forEach((select) => {
    const group = select.closest('form')?.querySelector('[data-plan-quota-group]');
    if (!group) return;
    const requestField = group.querySelector('[data-request-quota-field]');
    const tokenField = group.querySelector('[data-token-quota-field]');
    function apply() {
      const mode = select.value;
      if (requestField) requestField.style.display = mode === 'per_request' || mode === 'hybrid' ? '' : 'none';
      if (tokenField) tokenField.style.display = mode === 'per_token' || mode === 'hybrid' ? '' : 'none';
    }
    select.addEventListener('change', apply);
    apply();
  });

  document.querySelectorAll('.plan-model-row').forEach(setupPlanModelRow);
  document.querySelectorAll('[data-plan-model-add]').forEach((button) => {
    button.addEventListener('click', () => {
      const form = button.closest('form');
      const list = form?.querySelector('[data-plan-model-list]');
      const template = document.getElementById('plan-model-row-template');
      if (!list || !template) return;
      const index = list.querySelectorAll('.plan-model-row').length + 1;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = template.innerHTML.replace(/__INDEX__/g, String(index + 1)).trim();
      const row = wrapper.firstElementChild;
      if (!row) return;
      list.appendChild(row);
      setupPlanModelRow(row);
    });
  });

  document.querySelectorAll('[data-preset-provider]').forEach((providerSelect) => {
    const modelSelect = providerSelect.closest('form')?.querySelector('[data-preset-model-select]');
    if (!modelSelect) return;
    const applyPresetModelFilter = () => filterOptionsByProvider(providerSelect, modelSelect);
    providerSelect.addEventListener('change', applyPresetModelFilter);
    applyPresetModelFilter();
  });
}());
