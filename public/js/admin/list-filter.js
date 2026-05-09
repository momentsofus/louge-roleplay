/**
 * @file public/js/admin/list-filter.js
 * @description Shared client-side filtering for admin list cards.
 */
(function () {
  'use strict';

  const filters = document.querySelectorAll('[data-admin-filter]');
  if (!filters.length) return;

  function normalize(text) {
    return String(text || '').trim().toLowerCase();
  }

  filters.forEach((input) => {
    const targetId = input.dataset.filterTarget;
    const root = targetId ? document.getElementById(targetId) : null;
    if (!root) return;

    const items = Array.from(root.querySelectorAll('[data-filter-item]'));
    if (!items.length) return;

    function applyFilter() {
      const keyword = normalize(input.value);
      let visibleCount = 0;

      items.forEach((item) => {
        const haystack = normalize(item.dataset.filterText || item.textContent);
        const matched = !keyword || haystack.includes(keyword);
        item.hidden = !matched;
        if (matched) visibleCount += 1;
      });

      root.dataset.empty = visibleCount === 0 ? 'true' : 'false';
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  });
}());
