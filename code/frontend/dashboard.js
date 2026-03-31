/* ============================================================
   The Drop — dashboard.js
   Cart (insert, update qty, delete) + Drop Requests (insert, delete)
   + Purchase History
   ============================================================ */

   let currentUser = null;
   let cart = [];
   let myRequests = [];
   
   // ── AUTH ─────────────────────────────────────────────────────
   
   function init() {
     const stored = localStorage.getItem('drop_user');
     if (!stored) {
       window.location.href = 'login.html';
       return;
     }
     currentUser = JSON.parse(stored);
     document.getElementById('nav-username').textContent = currentUser.username || currentUser.email;
     loadDrops();
     loadProducts();
     loadMyRequests();
     loadPurchaseHistory();
   }
   
   function handleLogout() {
     localStorage.removeItem('drop_user');
     window.location.href = 'login.html';
   }
   
   // ── TOAST ────────────────────────────────────────────────────
   
   function showToast(msg) {
     const t = document.getElementById('toast');
     t.textContent = msg;
     t.classList.add('show');
     setTimeout(() => t.classList.remove('show'), 2500);
   }
   
   // ── DROPS ────────────────────────────────────────────────────
   
   async function loadDrops() {
     const el = document.getElementById('drops-list');
     try {
       const res  = await fetch('/api/drops');
       const data = await res.json();
       const upcoming = data.filter(d => d.status !== 'completed');
   
       if (!upcoming.length) {
         el.innerHTML = '<div class="dash-empty">No upcoming drops.</div>';
         return;
       }
   
       el.innerHTML = upcoming.map(drop => {
         const alreadyRequested = myRequests.some(r => r.drop_id === drop.drop_id);
         return `
           <div class="drop-list-item" id="drop-row-${drop.drop_id}">
             <div class="drop-list-info">
               <div class="drop-list-name">${drop.name}</div>
               <div class="drop-list-meta">${drop.retailer_name} · ${formatDate(drop.drop_start_at)}</div>
             </div>
             <button
               class="btn-request ${alreadyRequested ? 'requested' : ''}"
               id="req-btn-${drop.drop_id}"
               onclick="requestDrop(${drop.drop_id}, '${drop.name}')"
               ${alreadyRequested ? 'disabled' : ''}>
               ${alreadyRequested ? 'REQUESTED' : 'REQUEST'}
             </button>
           </div>`;
       }).join('');
     } catch {
       el.innerHTML = '<div class="dash-empty drop-error">Failed to load drops.</div>';
     }
   }
   
   // INSERT into requests table
   async function requestDrop(dropId, dropName) {
     try {
       const res  = await fetch('/api/requests', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ user_id: currentUser.user_id, drop_id: dropId })
       });
       const data = await res.json();
   
       if (data.success) {
         showToast(`Requested: ${dropName}`);
         const btn = document.getElementById(`req-btn-${dropId}`);
         if (btn) { btn.textContent = 'REQUESTED'; btn.classList.add('requested'); btn.disabled = true; }
         myRequests.push({ drop_id: dropId, drop_name: dropName, request_status: 'pending', request_id: data.request_id, created_at: new Date() });
         renderRequests();
       } else {
         showToast(data.message || 'Could not submit request.');
       }
     } catch {
       showToast('Failed to submit request.');
     }
   }
   
   // ── PRODUCTS ─────────────────────────────────────────────────
   
   async function loadProducts() {
     const el = document.getElementById('products-list');
     try {
       const res  = await fetch('/api/products');
       const data = await res.json();
   
       if (!data.length) {
         el.innerHTML = '<div class="dash-empty">No products available.</div>';
         return;
       }
   
       el.innerHTML = data.map(p => `
         <div class="dash-product-card">
           <div class="dash-product-brand">${p.brand}</div>
           <div class="dash-product-name">${p.name}</div>
           <div class="dash-product-colorway">${p.colorway || ''}</div>
           <div class="dash-product-footer">
             <span class="dash-product-price">$${parseFloat(p.price).toFixed(2)}</span>
             <button class="btn-add" onclick="addToCart(${p.product_id}, '${p.name.replace(/'/g,"\\'")}', ${p.price})">+ ADD</button>
           </div>
         </div>
       `).join('');
     } catch {
       el.innerHTML = '<div class="dash-empty drop-error">Failed to load products.</div>';
     }
   }
   
   // ── CART (client-side insert / update / delete) ───────────────
   
   function addToCart(productId, name, price) {
     const existing = cart.find(i => i.product_id === productId);
     if (existing) {
       existing.qty += 1;
       showToast(`Updated qty: ${name}`);
     } else {
       cart.push({ product_id: productId, name, price: parseFloat(price), qty: 1 });
       showToast(`Added: ${name}`);
     }
     renderCart();
   }
   
   // UPDATE quantity
   function updateQty(productId, delta) {
     const item = cart.find(i => i.product_id === productId);
     if (!item) return;
     item.qty += delta;
     if (item.qty <= 0) {
       removeFromCart(productId);
       return;
     }
     renderCart();
   }
   
   // DELETE from cart
   function removeFromCart(productId) {
     cart = cart.filter(i => i.product_id !== productId);
     showToast('Item removed.');
     renderCart();
   }
   
   function renderCart() {
     const el      = document.getElementById('cart-items');
     const footer  = document.getElementById('cart-footer');
     const countEl = document.getElementById('cart-count');
     const totalEl = document.getElementById('cart-total');
   
     const totalItems = cart.reduce((s, i) => s + i.qty, 0);
     const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
   
     countEl.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
     totalEl.textContent = `$${totalPrice.toFixed(2)}`;
     footer.style.display = cart.length ? 'block' : 'none';
   
     if (!cart.length) {
       el.innerHTML = '<div class="dash-empty">Your cart is empty.</div>';
       return;
     }
   
     el.innerHTML = cart.map(item => `
       <div class="cart-item">
         <div class="cart-item-info">
           <div class="cart-item-name">${item.name}</div>
           <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
         </div>
         <div class="cart-item-controls">
           <button class="cart-qty-btn" onclick="updateQty(${item.product_id}, -1)">−</button>
           <span class="cart-qty">${item.qty}</span>
           <button class="cart-qty-btn" onclick="updateQty(${item.product_id}, 1)">+</button>
           <button class="btn-remove" onclick="removeFromCart(${item.product_id})">×</button>
         </div>
       </div>
     `).join('');
   }
   
   // INSERT purchase into DB
   async function checkout() {
     if (!cart.length) return;
     try {
       const res  = await fetch('/api/purchase', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ user_id: currentUser.user_id, items: cart })
       });
       const data = await res.json();
       if (data.success) {
         cart = [];
         renderCart();
         loadPurchaseHistory();
         showToast('Order placed successfully!');
       } else {
         showToast(data.message || 'Checkout failed.');
       }
     } catch {
       showToast('Failed to place order.');
     }
   }
   
   // ── MY REQUESTS ───────────────────────────────────────────────
   
   async function loadMyRequests() {
     try {
       const res  = await fetch(`/api/requests/${currentUser.user_id}`);
       const data = await res.json();
       myRequests = data;
       renderRequests();
       loadDrops();
     } catch {
       document.getElementById('requests-list').innerHTML =
         '<div class="dash-empty drop-error">Failed to load requests.</div>';
     }
   }
   
   function renderRequests() {
     const el = document.getElementById('requests-list');
     if (!myRequests.length) {
       el.innerHTML = '<div class="dash-empty">No requests yet.</div>';
       return;
     }
   
     el.innerHTML = myRequests.map(r => `
       <div class="request-item" id="req-item-${r.request_id}">
         <div>
           <div class="request-name">${r.drop_name || 'Drop #' + r.drop_id}</div>
           <div class="request-date">${formatDate(r.created_at)}</div>
         </div>
         <div class="request-actions">
           <span class="drop-card-badge badge-${r.request_status}">${r.request_status.toUpperCase()}</span>
           ${r.request_status === 'pending'
             ? `<button class="btn-cancel" onclick="cancelRequest(${r.request_id}, ${r.drop_id})">CANCEL</button>`
             : ''}
         </div>
       </div>
     `).join('');
   }
   
   // DELETE request
   async function cancelRequest(requestId, dropId) {
     try {
       const res  = await fetch(`/api/requests/${requestId}`, { method: 'DELETE' });
       const data = await res.json();
       if (data.success) {
         myRequests = myRequests.filter(r => r.request_id !== requestId);
         renderRequests();
         const btn = document.getElementById(`req-btn-${dropId}`);
         if (btn) { btn.textContent = 'REQUEST'; btn.classList.remove('requested'); btn.disabled = false; }
         showToast('Request cancelled.');
       }
     } catch {
       showToast('Failed to cancel request.');
     }
   }
   
   // ── PURCHASE HISTORY ──────────────────────────────────────────
   
   async function loadPurchaseHistory() {
     const el = document.getElementById('purchases-list');
     try {
       const res  = await fetch(`/api/purchases/${currentUser.user_id}`);
       const data = await res.json();
   
       if (!data.length) {
         el.innerHTML = '<div class="dash-empty">No purchases yet.</div>';
         return;
       }
   
       el.innerHTML = data.map(p => `
         <div class="request-item">
           <div>
             <div class="request-name">${p.product_name}</div>
             <div class="request-date">${formatDate(p.purchased_at)} · $${parseFloat(p.total_amount).toFixed(2)}</div>
           </div>
           <span class="drop-card-badge badge-${p.purchase_status}">${p.purchase_status.toUpperCase()}</span>
         </div>
       `).join('');
     } catch {
       el.innerHTML = '<div class="dash-empty drop-error">Failed to load purchases.</div>';
     }
   }
   
   // ── HELPERS ──────────────────────────────────────────────────
   
   function formatDate(dateStr) {
     return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
   }
   
   // ── INIT ─────────────────────────────────────────────────────
   
   window.addEventListener('DOMContentLoaded', init);