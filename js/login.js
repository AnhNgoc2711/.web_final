function showTab(formId, event) {
  if (event) event.preventDefault();
  // Ẩn tất cả form
  document.querySelectorAll('.home-right form').forEach(f => f.classList.remove('active'));
  // Hiện form được chọn
  document.getElementById(formId).classList.add('active');
}
