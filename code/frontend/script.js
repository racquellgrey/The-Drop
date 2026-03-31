/* ============================================================
   The Drop — script.js
   CS 4604 · Spring 2026
   Fetches live data from the Express/MySQL backend
   ============================================================ */

   const BASE = '';

   function formatDate(dateStr) {
     const d = new Date(dateStr);
     return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
   }
   
   function formatTime(dateStr) {
     const d = new Date(dateStr);
     return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
   }
   
   function getBadge(status) {
     if (status === 'upcoming') return '<span class="drop-card-badge badge-live">LIVE</span>';
     if (status === 'completed') return '<span class="drop-card-badge badge-completed">ENDED</span>';
     return '<span class="drop-card-badge badge-soon">SOON</span>';
   }
   
   /* ── TICKER ─────────────────────────────────────────────── */
   async function loadTicker() {
     try {
       const res  = await fetch(`${BASE}/api/drops`);
       const data = await res.json();
       if (!data.length) return;
   
       const items = data.map(d =>
         `${d.name.toUpperCase()} — ${formatDate(d.drop_start_at)}`
       ).join(' &nbsp;&nbsp;·&nbsp;&nbsp; ');
   
       const ticker = document.getElementById('ticker-inner');
       ticker.innerHTML = `${items} &nbsp;&nbsp;·&nbsp;&nbsp; ${items}`;
     } catch {
       document.getElementById('ticker-inner').textContent = 'Could not load drop data.';
     }
   }
   
   /* ── DROPS GRID ─────────────────────────────────────────── */
   async function loadDrops() {
     const grid = document.getElementById('drop-events-grid');
     const liveCount = document.getElementById('live-count');
   
     try {
       const res  = await fetch(`${BASE}/api/drops`);
       const data = await res.json();
   
       const upcoming = data.filter(d => d.status !== 'completed');
       liveCount.textContent = `${upcoming.length} drop${upcoming.length !== 1 ? 's' : ''} live now`;
   
       if (!data.length) {
         grid.innerHTML = '<p class="drop-error">No drops found.</p>';
         return;
       }
   
       grid.innerHTML = data.map(drop => `
         <div class="drop-event-card">
           <div class="drop-event-top">
             <div>
               <div class="drop-event-name">${drop.name}</div>
               <div class="drop-event-retailer">${drop.retailer_name || 'Retailer'}</div>
             </div>
             ${getBadge(drop.status)}
           </div>
           <div class="drop-event-date">
             ${formatDate(drop.drop_start_at)} · ${formatTime(drop.drop_start_at)}
             ${drop.drop_end_at ? ' — ' + formatTime(drop.drop_end_at) : ''}
           </div>
         </div>
       `).join('');
     } catch {
       grid.innerHTML = '<p class="drop-error">Failed to load drops. Is the server running?</p>';
       liveCount.textContent = '';
     }
   }
   
   /* ── PRODUCTS GRID ──────────────────────────────────────── */
   async function loadProducts() {
     const grid = document.getElementById('products-grid');
   
     try {
       const res  = await fetch(`${BASE}/api/products`);
       const data = await res.json();
   
       if (!data.length) {
         grid.innerHTML = '<p class="drop-error">No products found.</p>';
         return;
       }
   
       grid.innerHTML = data.map(p => `
         <div class="drop-card">
           <div class="drop-card-brand">${p.brand}</div>
           <div class="drop-card-name">${p.name}</div>
           <div class="drop-card-colorway">${p.colorway || ''}</div>
           <div class="drop-card-footer">
             <span class="drop-card-price">$${parseFloat(p.price).toFixed(2)}</span>
             <span class="drop-card-badge badge-soon">${p.retailer_name || ''}</span>
           </div>
         </div>
       `).join('');
     } catch {
       grid.innerHTML = '<p class="drop-error">Failed to load products. Is the server running?</p>';
     }
   }
   
   /* ── STATS ──────────────────────────────────────────────── */
   async function loadStats() {
     try {
       const res  = await fetch(`${BASE}/api/stats`);
       const data = await res.json();
       document.getElementById('stat-products').textContent = data.products ?? '—';
       document.getElementById('stat-retailers').textContent = data.retailers ?? '—';
       document.getElementById('stat-drops').textContent = data.drops ?? '—';
     } catch {
       ['stat-products', 'stat-retailers', 'stat-drops'].forEach(id => {
         document.getElementById(id).textContent = '—';
       });
     }
   }
   
   /* ── INIT ───────────────────────────────────────────────── */
   async function init() {
     await Promise.all([loadTicker(), loadDrops(), loadProducts(), loadStats()]);
   }
   
   window.addEventListener('DOMContentLoaded', init);