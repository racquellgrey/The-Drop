/* ============================================================
   The Drop — product.js
   Product detail view: info, reviews, add-to-cart, review form
   ============================================================ */

const productId  = new URLSearchParams(window.location.search).get('id');
let currentUser  = null;
let currentProduct = null;
let selectedStars  = 0;

// ── INIT ──────────────────────────────────────────────────────

async function init() {
  if (!productId) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = JSON.parse(localStorage.getItem('drop_user') || 'null');

  await Promise.all([loadProduct(), loadReviews()]);

  if (currentUser) {
    await loadUserStatus();
  } else {
    renderActionButtons(null);
    document.getElementById('review-form-container').innerHTML =
      `<div class="review-note"><a href="login.html">Log in</a> to leave a review.</div>`;
  }
}

// ── PRODUCT ───────────────────────────────────────────────────

async function loadProduct() {
  try {
    const res = await fetch(`/api/products/${productId}`);
    if (!res.ok) throw new Error('not found');
    currentProduct = await res.json();
    renderProduct(currentProduct);
  } catch {
    document.getElementById('product-container').innerHTML =
      '<p class="drop-error" style="padding:3rem 2rem">Product not found.</p>';
  }
}

function renderProduct(p) {
  document.title = `${p.name} — The Drop`;
  document.getElementById('product-breadcrumb-name').textContent = p.name;
  document.getElementById('product-brand').textContent    = p.brand;
  document.getElementById('product-name').textContent     = p.name;
  document.getElementById('product-colorway').textContent = p.colorway || '';
  document.getElementById('product-price').textContent    = `$${parseFloat(p.price).toFixed(2)}`;
  document.getElementById('product-retailer').textContent = p.retailer_name || '—';
  document.getElementById('product-sku').textContent      = p.sku || '—';
  document.getElementById('product-description').textContent = p.description || '';

  if (p.image_url) {
    const block = document.getElementById('product-image-block');
    block.innerHTML = `<img src="${p.image_url}" alt="${p.name}" />`;
  }
}

// ── ACTION BUTTONS ────────────────────────────────────────────

function renderActionButtons(userStatus) {
  const el = document.getElementById('product-actions');
  if (!currentUser) {
    el.innerHTML = `
      <a href="login.html" class="btn-add-cart" style="text-align:center;text-decoration:none;">LOG IN TO BUY</a>
    `;
    return;
  }

  const cartKey = 'drop_cart';
  const cart    = JSON.parse(localStorage.getItem(cartKey) || '[]');
  const inCart  = cart.some(i => i.product_id === parseInt(productId));

  el.innerHTML = `
    <button
      class="btn-add-cart"
      id="add-cart-btn"
      onclick="handleAddToCart()"
      ${inCart ? 'disabled style="opacity:0.6;cursor:default"' : ''}
    >${inCart ? '✓ IN CART' : 'ADD TO CART'}</button>
    <a href="dashboard.html" class="btn-view-dash">VIEW DASHBOARD →</a>
    ${inCart ? '<span class="product-action-note">Item is in your cart. Head to the dashboard to check out.</span>' : ''}
  `;
}

function handleAddToCart() {
  if (!currentProduct) return;
  const cartKey = 'drop_cart';
  const cart    = JSON.parse(localStorage.getItem(cartKey) || '[]');
  const existing = cart.find(i => i.product_id === currentProduct.product_id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      product_id: currentProduct.product_id,
      name:  currentProduct.name,
      price: parseFloat(currentProduct.price),
      qty:   1
    });
  }
  localStorage.setItem(cartKey, JSON.stringify(cart));
  showToast(`Added: ${currentProduct.name}`);
  renderActionButtons(null);
}

// ── REVIEWS ───────────────────────────────────────────────────

async function loadReviews() {
  const summaryEl = document.getElementById('reviews-summary');
  const listEl    = document.getElementById('reviews-list');

  try {
    const res  = await fetch(`/api/products/${productId}/reviews`);
    const data = await res.json();
    const { reviews, avg_stars, review_count } = data;

    if (review_count > 0) {
      summaryEl.innerHTML = `
        <span class="stars-display">${buildStarDisplay(avg_stars)}</span>
        <span class="reviews-avg">${avg_stars.toFixed(1)}</span>
        <span class="reviews-count">(${review_count} review${review_count !== 1 ? 's' : ''})</span>
      `;
    } else {
      summaryEl.innerHTML = '<span style="color:var(--muted);font-size:11px;">No reviews yet</span>';
    }

    if (!reviews.length) {
      listEl.innerHTML = '<div class="reviews-empty">No reviews yet. Be the first!</div>';
      return;
    }

    listEl.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="review-header">
          <span class="review-username">@${r.username}</span>
          <span class="review-stars">${buildStarDisplay(r.stars)}</span>
          <span class="review-date">${formatDate(r.rated_at || r.feedback_at)}</span>
        </div>
        ${r.feedback_text ? `<div class="review-text">${escapeHtml(r.feedback_text)}</div>` : ''}
      </div>
    `).join('');
  } catch {
    listEl.innerHTML = '<div class="reviews-empty drop-error">Failed to load reviews.</div>';
    summaryEl.innerHTML = '';
  }
}

// ── USER REVIEW STATUS ────────────────────────────────────────

async function loadUserStatus() {
  try {
    const res    = await fetch(`/api/products/${productId}/user-status/${currentUser.user_id}`);
    const status = await res.json();
    renderActionButtons(status);
    renderReviewFormArea(status);
  } catch {
    renderActionButtons(null);
  }
}

function renderReviewFormArea(status) {
  const el = document.getElementById('review-form-container');

  if (!status.has_purchased) {
    el.innerHTML = `<div class="review-note">Purchase this product to leave a review.</div>`;
    return;
  }
  if (status.has_reviewed) {
    el.innerHTML = `<div class="review-note">You have already reviewed this product — thanks!</div>`;
    return;
  }

  el.innerHTML = `
    <div class="review-form">
      <div class="review-form-title">Write a Review</div>
      <div class="review-stars-label">Your Rating</div>
      <div class="star-picker" id="star-picker">
        ${[1,2,3,4,5].map(n =>
          `<button class="star-btn" data-val="${n}" onclick="selectStar(${n})">☆</button>`
        ).join('')}
      </div>
      <textarea
        class="review-textarea"
        id="review-text"
        placeholder="Share your thoughts about this product (optional)…"
        rows="4"
      ></textarea>
      <div class="review-form-actions">
        <button
          class="btn-add-cart"
          style="flex:none;padding:12px 24px;"
          onclick="submitReview(${status.purchase_id})"
        >SUBMIT REVIEW</button>
      </div>
    </div>
  `;
}

function selectStar(val) {
  selectedStars = val;
  const buttons = document.querySelectorAll('.star-btn');
  buttons.forEach(btn => {
    const n = parseInt(btn.dataset.val);
    btn.textContent = n <= val ? '★' : '☆';
    btn.classList.toggle('active', n <= val);
  });
}

async function submitReview(purchaseId) {
  if (!selectedStars) {
    showToast('Please select a star rating.');
    return;
  }
  const text = document.getElementById('review-text').value.trim();

  try {
    const res  = await fetch(`/api/products/${productId}/reviews`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        user_id:     currentUser.user_id,
        purchase_id: purchaseId,
        stars:       selectedStars,
        text:        text || null
      })
    });
    const data = await res.json();

    if (data.success) {
      showToast('Review submitted!');
      document.getElementById('review-form-container').innerHTML =
        '<div class="review-note">Thanks for your review!</div>';
      await loadReviews();
    } else {
      showToast(data.message || 'Could not submit review.');
    }
  } catch {
    showToast('Failed to submit review.');
  }
}

// ── HELPERS ───────────────────────────────────────────────────

function buildStarDisplay(count) {
  const full  = Math.floor(count);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── BOOT ──────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', init);
