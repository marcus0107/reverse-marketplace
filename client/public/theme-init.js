// Runs before the page paints so the saved theme shows with no flash. Default is light.
(function () {
  try {
    var t = localStorage.getItem('reverse_theme');
    document.documentElement.dataset.theme = t === 'dark' ? 'dark' : 'light';
  } catch (e) { document.documentElement.dataset.theme = 'light'; }
})();
