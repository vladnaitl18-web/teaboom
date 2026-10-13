(() => {
  'use strict';

  const ADDED_STATE_MS = 1800;
  const PRODUCT_NAME = 'Ананасовый улун';

  const form = document.querySelector('[data-product-form]');
  if (!form) return;

  const els = {
    sku: document.querySelector('[data-product-sku]'),
    discountBadge: document.querySelector('.product__discount'),
    discount: document.querySelector('[data-product-discount]'),
    priceBox: form.querySelector('.price'),
    price: form.querySelector('[data-product-price]'),
    oldPrice: form.querySelector('[data-product-old-price]'),
    note: form.querySelector('[data-product-note]'),
    submit: form.querySelector('[data-product-submit]'),
    submitLabel: form.querySelector('[data-product-submit-label]'),
    status: form.querySelector('[data-product-status]'),
  };

  const defaultSubmitLabel = els.submitLabel.textContent;
  let addedTimer = null;

  // Restart a one-shot CSS animation bound to a state class
  const replay = (el, className) => {
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  };

  // 326.4 -> "326,40 ₽", 1432 -> "1 432 ₽"
  const formatPrice = (value) =>
    `${value.toLocaleString('ru-RU', {
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    })} ₽`;

  const readPack = (input) => ({
    weight: Number(input.value),
    sku: input.dataset.sku,
    price: Number(input.dataset.price),
    oldPrice: Number(input.dataset.oldPrice) || null,
  });

  const getSelectedPack = () => readPack(form.querySelector('input[name="pack"]:checked'));

  const resetSubmit = () => {
    clearTimeout(addedTimer);
    els.submit.classList.remove('is-added');
    els.submitLabel.textContent = defaultSubmitLabel;
  };

  const render = ({ weight, sku, price, oldPrice }) => {
    const hasDiscount = oldPrice !== null && oldPrice > price;
    const unitPrice = `${formatPrice((price / weight) * 100)} за 100 г`;

    els.sku.textContent = sku;
    els.price.textContent = formatPrice(price);
    els.priceBox.classList.toggle('price--sale', hasDiscount);

    els.oldPrice.hidden = !hasDiscount;
    els.discountBadge.hidden = !hasDiscount;

    if (hasDiscount) {
      els.oldPrice.textContent = formatPrice(oldPrice);
      els.discount.textContent = Math.round((1 - price / oldPrice) * 100);
    }

    const notes = [];
    if (hasDiscount) notes.push(`выгода ${formatPrice(oldPrice - price)}`);
    if (weight !== 100) notes.push(unitPrice);
    els.note.textContent = notes.join(' · ');
  };

  form.addEventListener('change', (event) => {
    if (event.target.name !== 'pack') return;
    resetSubmit();
    render(readPack(event.target));
    replay(els.priceBox, 'is-updated');
  });

  // No real cart: confirm the action and let cart.js bump the header counter
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const { weight } = getSelectedPack();

    resetSubmit();
    els.submit.classList.add('is-added');
    els.submitLabel.textContent = 'Добавлено';
    els.status.textContent = `${PRODUCT_NAME}, ${weight} г — добавлено в корзину`;

    document.dispatchEvent(new CustomEvent('cart:add'));

    addedTimer = setTimeout(resetSubmit, ADDED_STATE_MS);
  });

  render(getSelectedPack());
})();
