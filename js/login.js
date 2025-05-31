function showTab(formId, event) {
  if (event) event.preventDefault();
  document.querySelectorAll('.home-right form').forEach(f => f.classList.remove('active'));
  document.getElementById(formId).classList.add('active');
}
