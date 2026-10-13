// Demo cart: only a counter in the header, kept for the browser session.
// Other scripts add an item by dispatching a `cart:add` event on document.
(() => {
  'use strict';

  const STORAGE_KEY = 'teaboom-cart-count';
  const ADDED_STATE_MS = 1800;

  const indicator = document.querySelector('[data-cart]');
  const counter = document.querySelector('[data-cart-count]');
  const status = document.querySelector('[data-cart-status]');
  if (!indicator || !counter) return;

  const readCount = () => {
    try {
      return Number(sessionStorage.getItem(STORAGE_KEY)) || 0;
    } catch {
      return 0;
    }
  };

  const saveCount = (value) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Storage can be unavailable (private mode, file://): the counter still works per page
    }
  };

  let count = readCount();
  counter.textContent = count;

  document.addEventListener('cart:add', () => {
    count += 1;
    counter.textContent = count;
    saveCount(count);

    indicator.classList.remove('is-bumped');
    void indicator.offsetWidth;
    indicator.classList.add('is-bumped');
  });

  // Product tiles: buttons marked with data-add-to-cart
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-to-cart]');
    if (!button || button.classList.contains('is-added')) return;

    const label = button.querySelector('[data-add-to-cart-label]');
    const defaultLabel = label.textContent;
    const title = button.closest('.tile')?.querySelector('.tile__title')?.textContent.trim();

    document.dispatchEvent(new CustomEvent('cart:add'));

    button.classList.add('is-added');
    label.textContent = 'Добавлено';
    if (status && title) status.textContent = `${title} — добавлено в корзину`;

    setTimeout(() => {
      button.classList.remove('is-added');
      label.textContent = defaultLabel;
    }, ADDED_STATE_MS);
  });
})();
