/* ============================================================
   The Drop — nav.js
   Login dropdown toggle + auth-aware nav state
   ============================================================ */

function toggleDropdown() {
  const d = document.getElementById('login-dropdown');
  if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', function (e) {
  const d = document.getElementById('login-dropdown');
  if (d && !e.target.closest('.drop-nav-actions')) {
    d.style.display = 'none';
  }
});

/* Replace login/signup buttons with a Dashboard link when already signed in */
(function updateNavForAuth() {
  const user     = JSON.parse(localStorage.getItem('drop_user')     || 'null');
  const retailer = JSON.parse(localStorage.getItem('drop_retailer') || 'null');
  const navActions = document.getElementById('nav-actions') ||
                     document.querySelector('.drop-nav-actions');
  if (!navActions) return;

  if (user) {
    navActions.innerHTML = `
      <span style="font-family:var(--font-mono);font-size:11px;color:var(--muted2);letter-spacing:0.08em;padding:8px 4px;">
        ${user.username || user.first_name || 'Account'}
      </span>
      <a href="dashboard.html" class="btn-ghost" style="text-decoration:none;">Dashboard</a>
    `;
  } else if (retailer) {
    navActions.innerHTML = `
      <span style="font-family:var(--font-mono);font-size:11px;color:var(--muted2);letter-spacing:0.08em;padding:8px 4px;">
        ${retailer.name || 'Retailer'}
      </span>
      <a href="retailer-dashboard.html" class="btn-ghost" style="text-decoration:none;">Retailer Portal</a>
    `;
  }
  /* else: keep the default login/signup buttons as-is */
})();
