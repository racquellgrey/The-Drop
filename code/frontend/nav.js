function toggleDropdown() {
    const d = document.getElementById('login-dropdown');
    d.style.display = d.style.display === 'none' ? 'block' : 'none';
  }
  
  document.addEventListener('click', function(e) {
    const d = document.getElementById('login-dropdown');
    if (!e.target.closest('.drop-nav-actions')) {
      d.style.display = 'none';
    }
  });