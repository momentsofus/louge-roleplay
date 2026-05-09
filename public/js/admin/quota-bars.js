/**
 * @file public/js/admin/quota-bars.js
 * @description Apply CSS custom-property width values for admin quota bars.
 */
(function () {
  'use strict';

  document.querySelectorAll('.quota-bar--admin [data-width]').forEach((bar) => {
    const value = Math.max(0, Math.min(100, Number(bar.dataset.width || 0)));
    bar.style.setProperty('--quota-width', String(value));
  });
}());
