const displayName = document.getElementById('displayName');
const userNameDiv = document.getElementById('userName');
const nameInput = document.getElementById('nameInput');
const userEmail = document.getElementById('userEmail');

const viewButtons = document.getElementById('viewButtons');
const editActions = document.getElementById('editActions');
const editInfoBtn = document.getElementById('editInfoBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

// Hàm gọi khi load trang hoặc có dữ liệu user từ server
function loadUserInfo(user) {
  const name = user.name && user.name.trim() !== '' ? user.name : 'Username';
  const email = user.email || 'user@example.com';

  displayName.textContent = name;
  userNameDiv.textContent = name;
  userEmail.textContent = email;
}

function enterEditMode() {
  displayName.classList.add('hidden');
  userEmail.parentElement.classList.add('hidden');
  viewButtons.classList.add('hidden');

  nameInput.classList.remove('hidden');
  editActions.classList.remove('hidden');

  nameInput.value = displayName.textContent.trim();
  nameInput.focus();
}

function exitEditMode() {
  displayName.classList.remove('hidden');
  userEmail.parentElement.classList.remove('hidden');
  viewButtons.classList.remove('hidden');

  nameInput.classList.add('hidden');
  editActions.classList.add('hidden');
}

function saveName() {
  const newName = nameInput.value.trim();
  if (newName === '') {
    alert('Tên không được để trống!');
    nameInput.focus();
    return;
  }

  fetch('name_email.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({ name: newName })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      displayName.textContent = newName;
      userNameDiv.textContent = newName;
      exitEditMode();
    } else {
      alert('Lỗi cập nhật tên: ' + data.error);
    }
  })
  .catch(() => alert('Lỗi kết nối server'));
}

// Sự kiện
editInfoBtn.addEventListener('click', enterEditMode);
cancelEditBtn.addEventListener('click', exitEditMode);
saveEditBtn.addEventListener('click', saveName);
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    saveName();
  }
  $user_name = $user['name'] ?? 'Username';
$user_email = $user['email'] ?? 'user@example.com';

});
