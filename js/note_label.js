const labelIcon = document.getElementById('label-icon');
const labelPopup = document.getElementById('label-popup');

labelIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  if (labelPopup.style.display === 'block') {
    labelPopup.style.display = 'none';
  } else {
    labelPopup.style.display = 'block';
  }
});

document.addEventListener('click', (e) => {
  if (!labelPopup.contains(e.target) && !labelIcon.contains(e.target)) {
    labelPopup.style.display = 'none';
  }
});

  let labels = [];
  let selectedLabels = new Set(); 
document.addEventListener('DOMContentLoaded', () => {
  const LabelList = document.getElementById('label-list');
  const newLabelInput = document.getElementById('new-label-input');
  const addLabelBtn = document.getElementById('add-label-btn');



  function showMessage(msg, duration = 3000) {
  const msgBox = document.getElementById('messageBox');
  const msgText = document.getElementById('messageText');
  msgText.textContent = msg;
  msgBox.style.display = 'block';

  setTimeout(() => {
    msgBox.style.display = 'none';
  }, duration);
}

  function renderLabels() {
    LabelList.innerHTML = '';
    labels.forEach(label => {
      const li = document.createElement('li');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = label.label_id;
      checkbox.checked = selectedLabels.has(label.label_id);
      checkbox.addEventListener('change', e => {
        if (e.target.checked) selectedLabels.add(label.label_id);
        else selectedLabels.delete(label.label_id);
        console.log('Selected labels:', Array.from(selectedLabels));
      });

      const labelText = document.createElement('span');
      labelText.textContent = label.name_label;

      li.appendChild(checkbox);
      li.appendChild(labelText);
      LabelList.appendChild(li);
    });
  }

  async function loadLabelsFromDB() {
    try {
      const res = await fetch('label.php');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          labels = data.data;
          renderLabels();
        } else {
          alert('Lỗi tải nhãn: ' + (data.error || 'Dữ liệu không hợp lệ'));
          labels = [];
          renderLabels();
        }
      } else {
        alert('Lỗi kết nối server');
      }
    } catch (e) {
      alert('Lỗi tải nhãn: ' + e.message);
    }
  }
  loadLabelsFromDB();

  newLabelInput.addEventListener('input', () => {
    addLabelBtn.disabled = newLabelInput.value.trim() === '';
  });

  addLabelBtn.disabled = newLabelInput.value.trim() === '';

  addLabelBtn.addEventListener('click', async () => {
  const newLabel = newLabelInput.value.trim();
  if (!newLabel) return;

  const isDuplicate = labels.some(label =>
  label.name_label.toLowerCase() === newLabel.toLowerCase()
);
if (isDuplicate) {
  showMessage('Tên nhãn đã tồn tại!');
  return;  // không thêm nếu trùng
}


  try {
    const res = await fetch('add_label.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', label: newLabel }),
    });
    const data = await res.json();
    if (data.success) {
      newLabelInput.value = '';
      // Thêm nhãn mới vào mảng labels luôn, tránh phải gọi lại API
      labels.push({ label_id: data.label_id, name_label: newLabel });
      renderLabels();
    } else {
      alert('Thêm nhãn thất bại: ' + (data.error || ''));
    }
  } catch (e) {
    alert('Lỗi thêm nhãn: ' + e.message);
  }
});
});
