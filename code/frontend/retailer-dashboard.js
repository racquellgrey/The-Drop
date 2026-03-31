/* ============================================================
   The Drop — retailer-dashboard.js
   Full CRUD: Products + Drops + View Orders
   ============================================================ */

   let currentRetailer = null;
   let pendingDelete = null;
   
   // ── AUTH ─────────────────────────────────────────────────────
   
   function init() {
     const stored = localStorage.getItem('drop_retailer');
     if (!stored) { window.location.href = 'retailer-login.html'; return; }
     currentRetailer = JSON.parse(stored);
     document.getElementById('nav-retailer').textContent = currentRetailer.name;
     showTab('products');
   }
   
   function handleLogout() {
     localStorage.removeItem('drop_retailer');
     window.location.href = 'retailer-login.html';
   }
   
   // ── TABS ─────────────────────────────────────────────────────
   
   function showTab(tab) {
     ['products', 'drops', 'orders'].forEach(t => {
       document.getElementById(`tab-${t}`).style.display = t === tab ? 'block' : 'none';
     });
     if (tab === 'products') loadProducts();
     if (tab === 'drops')    loadDrops();
     if (tab === 'orders')   loadOrders();
   }
   
   // ── TOAST ────────────────────────────────────────────────────
   
   function showToast(msg) {
     const t = document.getElementById('toast');
     t.textContent = msg;
     t.classList.add('show');
     setTimeout(() => t.classList.remove('show'), 2500);
   }
   
   function setFeedback(id, msg, type) {
     const el = document.getElementById(id);
     el.textContent = msg;
     el.className = `r-feedback ${type}`;
     setTimeout(() => { el.textContent = ''; el.className = 'r-feedback'; }, 3000);
   }
   
   // ── MODAL ────────────────────────────────────────────────────
   
   function openModal(title, body, onConfirm) {
     document.getElementById('modal-title').textContent = title;
     document.getElementById('modal-body').textContent  = body;
     document.getElementById('modal-backdrop').style.display = 'flex';
     document.getElementById('modal-confirm-btn').onclick = () => { closeModal(); onConfirm(); };
   }
   
   function closeModal() {
     document.getElementById('modal-backdrop').style.display = 'none';
   }
   
   // ── HELPERS ──────────────────────────────────────────────────
   
   function formatDate(str) {
     return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
   }
   
   function formatDateTime(str) {
     if (!str) return '—';
     const d = new Date(str);
     return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
            d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
   }
   
   function toLocalDateTimeInput(str) {
     if (!str) return '';
     const d = new Date(str);
     return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
   }
   
   // ── PRODUCTS ─────────────────────────────────────────────────
   
   async function loadProducts() {
     const el = document.getElementById('products-table');
     try {
       const res  = await fetch(`/api/retailer/${currentRetailer.retailer_id}/products`);
       const data = await res.json();
       document.getElementById('product-count').textContent = `${data.length} product${data.length !== 1 ? 's' : ''}`;
   
       if (!data.length) {
         el.innerHTML = '<div class="dash-empty">No products yet. Add one using the form.</div>';
         return;
       }
   
       el.innerHTML = `
         <div class="r-table-header" style="grid-template-columns: 2fr 1fr 1fr auto">
           <span>Product</span><span>SKU</span><span>Price</span><span></span>
         </div>
         ${data.map(p => `
           <div class="r-table-row" style="grid-template-columns: 2fr 1fr 1fr auto">
             <div>
               <div class="r-table-name">${p.name}</div>
               <div class="r-table-meta">${p.brand} ${p.colorway ? '· ' + p.colorway : ''}</div>
             </div>
             <div class="r-table-meta">${p.sku}</div>
             <div class="r-table-meta">$${parseFloat(p.price).toFixed(2)}</div>
             <div class="r-row-actions">
               <button class="btn-edit" onclick="editProduct(${JSON.stringify(p).replace(/"/g, '&quot;')})">EDIT</button>
               <button class="r-btn-danger" onclick="confirmDeleteProduct(${p.product_id}, '${p.name.replace(/'/g,"\\'")}')">DEL</button>
             </div>
           </div>
         `).join('')}
       `;
     } catch {
       el.innerHTML = '<div class="dash-empty drop-error">Failed to load products.</div>';
     }
   }
   
   // INSERT product
   async function saveProduct() {
     const id          = document.getElementById('product-id').value;
     const name        = document.getElementById('product-name').value.trim();
     const brand       = document.getElementById('product-brand').value.trim();
     const sku         = document.getElementById('product-sku').value.trim();
     const price       = document.getElementById('product-price').value;
     const colorway    = document.getElementById('product-colorway').value.trim();
     const description = document.getElementById('product-description').value.trim();
   
     if (!name || !brand || !sku || !price) {
       setFeedback('product-feedback', 'Name, brand, SKU and price are required.', 'error');
       return;
     }
   
     const payload = { name, brand, sku, price, colorway, description, retailer_id: currentRetailer.retailer_id };
     const method  = id ? 'PUT' : 'POST';
     const url     = id ? `/api/retailer/products/${id}` : '/api/retailer/products';
   
     try {
       const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
       const data = await res.json();
       if (data.success) {
         setFeedback('product-feedback', id ? 'Product updated.' : 'Product added.', 'success');
         showToast(id ? 'Product updated.' : 'Product added.');
         resetProductForm();
         loadProducts();
       } else {
         setFeedback('product-feedback', data.message || 'Failed to save product.', 'error');
       }
     } catch {
       setFeedback('product-feedback', 'Server error.', 'error');
     }
   }
   
   // Load product into form for UPDATE
   function editProduct(p) {
     document.getElementById('product-id').value          = p.product_id;
     document.getElementById('product-name').value        = p.name;
     document.getElementById('product-brand').value       = p.brand;
     document.getElementById('product-sku').value         = p.sku;
     document.getElementById('product-price').value       = p.price;
     document.getElementById('product-colorway').value    = p.colorway || '';
     document.getElementById('product-description').value = p.description || '';
     document.getElementById('product-form-title').textContent = 'Edit Product';
     document.getElementById('product-cancel-btn').style.display = 'block';
     window.scrollTo({ top: 0, behavior: 'smooth' });
   }
   
   function resetProductForm() {
     ['product-id','product-name','product-brand','product-sku','product-price','product-colorway','product-description'].forEach(id => {
       document.getElementById(id).value = '';
     });
     document.getElementById('product-form-title').textContent = 'Add Product';
     document.getElementById('product-cancel-btn').style.display = 'none';
   }
   
   // DELETE product
   function confirmDeleteProduct(id, name) {
     openModal('Delete Product', `Are you sure you want to delete "${name}"? This cannot be undone.`, async () => {
       try {
         const res  = await fetch(`/api/retailer/products/${id}`, { method: 'DELETE' });
         const data = await res.json();
         if (data.success) { showToast('Product deleted.'); loadProducts(); }
         else showToast(data.message || 'Failed to delete.');
       } catch { showToast('Server error.'); }
     });
   }
   
   // ── DROPS ────────────────────────────────────────────────────
   
   async function loadDrops() {
     const el = document.getElementById('drops-table');
     try {
       const res  = await fetch(`/api/retailer/${currentRetailer.retailer_id}/drops`);
       const data = await res.json();
       document.getElementById('drop-count').textContent = `${data.length} drop${data.length !== 1 ? 's' : ''}`;
   
       if (!data.length) {
         el.innerHTML = '<div class="dash-empty">No drops yet. Create one using the form.</div>';
         return;
       }
   
       el.innerHTML = `
         <div class="r-table-header" style="grid-template-columns: 2fr 1fr 1fr auto">
           <span>Drop</span><span>Start</span><span>Status</span><span></span>
         </div>
         ${data.map(d => `
           <div class="r-table-row" style="grid-template-columns: 2fr 1fr 1fr auto">
             <div>
               <div class="r-table-name">${d.name}</div>
               <div class="r-table-meta">${d.description ? d.description.substring(0, 60) + '...' : '—'}</div>
             </div>
             <div class="r-table-meta">${formatDateTime(d.drop_start_at)}</div>
             <div><span class="drop-card-badge badge-${d.status}">${d.status.toUpperCase()}</span></div>
             <div class="r-row-actions">
               <button class="btn-edit" onclick="editDrop(${JSON.stringify(d).replace(/"/g, '&quot;')})">EDIT</button>
               <button class="r-btn-danger" onclick="confirmDeleteDrop(${d.drop_id}, '${d.name.replace(/'/g,"\\'")}')">DEL</button>
             </div>
           </div>
         `).join('')}
       `;
     } catch {
       el.innerHTML = '<div class="dash-empty drop-error">Failed to load drops.</div>';
     }
   }
   
   // INSERT or UPDATE drop
   async function saveDrop() {
     const id          = document.getElementById('drop-id').value;
     const name        = document.getElementById('drop-name').value.trim();
     const description = document.getElementById('drop-description').value.trim();
     const start       = document.getElementById('drop-start').value;
     const end         = document.getElementById('drop-end').value;
     const status      = document.getElementById('drop-status').value;
   
     if (!name || !start) {
       setFeedback('drop-feedback', 'Name and start date are required.', 'error');
       return;
     }
   
     const payload = { name, description, drop_start_at: start, drop_end_at: end || null, status, retailer_id: currentRetailer.retailer_id };
     const method  = id ? 'PUT' : 'POST';
     const url     = id ? `/api/retailer/drops/${id}` : '/api/retailer/drops';
   
     try {
       const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
       const data = await res.json();
       if (data.success) {
         setFeedback('drop-feedback', id ? 'Drop updated.' : 'Drop created.', 'success');
         showToast(id ? 'Drop updated.' : 'Drop created.');
         resetDropForm();
         loadDrops();
       } else {
         setFeedback('drop-feedback', data.message || 'Failed to save drop.', 'error');
       }
     } catch {
       setFeedback('drop-feedback', 'Server error.', 'error');
     }
   }
   
   // Load drop into form for UPDATE
   function editDrop(d) {
     document.getElementById('drop-id').value          = d.drop_id;
     document.getElementById('drop-name').value        = d.name;
     document.getElementById('drop-description').value = d.description || '';
     document.getElementById('drop-start').value       = toLocalDateTimeInput(d.drop_start_at);
     document.getElementById('drop-end').value         = toLocalDateTimeInput(d.drop_end_at);
     document.getElementById('drop-status').value      = d.status;
     document.getElementById('drop-form-title').textContent = 'Edit Drop';
     document.getElementById('drop-cancel-btn').style.display = 'block';
     window.scrollTo({ top: 0, behavior: 'smooth' });
   }
   
   function resetDropForm() {
     ['drop-id','drop-name','drop-description','drop-start','drop-end'].forEach(id => {
       document.getElementById(id).value = '';
     });
     document.getElementById('drop-status').value = 'upcoming';
     document.getElementById('drop-form-title').textContent = 'Create Drop';
     document.getElementById('drop-cancel-btn').style.display = 'none';
   }
   
   // DELETE drop
   function confirmDeleteDrop(id, name) {
     openModal('Delete Drop', `Are you sure you want to delete "${name}"? This cannot be undone.`, async () => {
       try {
         const res  = await fetch(`/api/retailer/drops/${id}`, { method: 'DELETE' });
         const data = await res.json();
         if (data.success) { showToast('Drop deleted.'); loadDrops(); }
         else showToast(data.message || 'Failed to delete.');
       } catch { showToast('Server error.'); }
     });
   }
   
   // ── ORDERS ───────────────────────────────────────────────────
   
   async function loadOrders() {
     const el = document.getElementById('orders-table');
     try {
       const res  = await fetch(`/api/retailer/${currentRetailer.retailer_id}/orders`);
       const data = await res.json();
       document.getElementById('orders-count').textContent = `${data.length} order${data.length !== 1 ? 's' : ''}`;
   
       if (!data.length) {
         el.innerHTML = '<div class="dash-empty">No orders yet.</div>';
         return;
       }
   
       el.innerHTML = `
         <div class="r-table-header" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr">
           <span>Product</span><span>Buyer</span><span>Qty</span><span>Total</span><span>Status</span>
         </div>
         ${data.map(o => `
           <div class="r-table-row" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr">
             <div>
               <div class="r-table-name">${o.product_name}</div>
               <div class="r-table-meta">${formatDate(o.purchased_at)}</div>
             </div>
             <div class="r-table-meta">${o.buyer_email}</div>
             <div class="r-table-meta">${o.qty}</div>
             <div class="r-table-meta">$${parseFloat(o.total_amount).toFixed(2)}</div>
             <div><span class="drop-card-badge badge-${o.purchase_status}">${o.purchase_status.toUpperCase()}</span></div>
           </div>
         `).join('')}
       `;
     } catch {
       el.innerHTML = '<div class="dash-empty drop-error">Failed to load orders.</div>';
     }
   }
   
   // ── INIT ─────────────────────────────────────────────────────
   
   window.addEventListener('DOMContentLoaded', init);