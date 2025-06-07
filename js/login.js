function showTab(formId, event) {
  if (event) event.preventDefault();
  document.querySelectorAll('.home-right form').forEach(f => f.classList.remove('active'));
  document.getElementById(formId).classList.add('active');
}

// Ẩn/hiện Password
document.querySelectorAll('.toggle-password').forEach(icon => {
  icon.addEventListener('click', () => {
    const input = icon.previousElementSibling;
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('bi-eye-slash');
      icon.classList.add('bi-eye');
    } else {
      input.type = 'password';
      icon.classList.remove('bi-eye');
      icon.classList.add('bi-eye-slash');
      }
  });
});
