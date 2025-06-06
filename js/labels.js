document.addEventListener('DOMContentLoaded', async () => {
  const modal = document.getElementById('labelModal');
  const addLabelBtn = document.getElementById('openLabelModalBtn');
  const closeBtn = document.querySelector('.close-modal');
  const input = document.getElementById('newLabelInput');
  const labelList = document.getElementById('labelList');
  const labellist = document.getElementById('labellist');
  const newLabelInput = document.getElementById('newLabelInput');
  const tagDropdown = document.getElementById('tagDropdown');
  

  let labels = [];

  function showMessage(msg, duration = 3000) {
  const msgBox = document.getElementById('messageBox');
  const msgText = document.getElementById('messageText');
  msgText.textContent = msg;
  msgBox.style.display = 'block';

  setTimeout(() => {
    msgBox.style.display = 'none';
  }, duration);
}

  // ----------------------------
  // 1. Hàm render (phải đặt trước load)
  // ----------------------------
  
  const renderLabels = () => {
    labelList.innerHTML = '';
    labels.forEach((labelObj, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="bi bi-tag label-name" data-index="${index}" data-id="${labelObj.label_id}" contenteditable="false">${labelObj.name_label}</span>
        <span class="label-icons">
          <i class="edit-label" title="Edit" data-index="${index}" data-id="${labelObj.label_id}"></i>
          <i class="delete-label text-danger" title="Delete" data-index="${index}" data-id="${labelObj.label_id}"></i>
        </span>
      `;
      labelList.appendChild(li);
    });
  };
  
  const renderModalLabels = () => {
  if (!labellist) {
    console.error('labellist is null!');
    return;
  }
  labellist.innerHTML = '';
  labels.forEach((labelObj, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="label-name" data-index="${index}" data-id="${labelObj.label_id}" contenteditable="false">${labelObj.name_label}</span>
      <span class="label-icons">
        <i class="bi bi-pencil edit-label" title="Edit" data-index="${index}" data-id="${labelObj.label_id}"></i>
        <i class="bi bi-trash delete-label text-danger" title="Delete" data-index="${index}" data-id="${labelObj.label_id}"></i>
      </span>
    `;
    labellist.appendChild(li);
  });
};

function renderLabelsInNoteInput() {
  if (!tagDropdown) return;
  tagDropdown.innerHTML = '';
  labels.forEach(label => {
    const div = document.createElement('div');
    div.className = 'label-item';
    div.textContent = label.name_label;
    div.dataset.id = label.label_id;
    tagDropdown.appendChild(div);
  });
}


  // ----------------------------
  // 2. Load labels từ DB
  // ----------------------------
  async function loadLabelsFromDB() {
  const res = await fetch('label.php');
  if (res.ok) {
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      labels = data.data;

      // ✅ Cập nhật global để các file khác dùng
      window.labels = labels;

      renderLabels();
      renderModalLabels();
      renderLabelsInNoteInput();

      // ✅ Cập nhật sidebar filter
      window.renderFilterLabels();

      // ✅ Gửi sự kiện cho phần note nhận được nhãn mới
      document.dispatchEvent(new CustomEvent("labelsUpdated", { detail: labels }));
    } else {
      labels = [];
      renderLabels();
      renderModalLabels();
      renderLabelsInNoteInput();
      window.renderFilterLabels();
      document.dispatchEvent(new CustomEvent("labelsUpdated", { detail: labels }));
    }
  }
}

  
  // ----------------------------
  // 3. CRUD từ DB
  // ----------------------------
  async function addLabelToDB(labelName) {
    const formData = new URLSearchParams();
    formData.append('action', 'add');
    formData.append('label', labelName);

    const res = await fetch('label.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await res.json();
    return data.success;
  }

  async function updateLabel(label_id, newName) {
    const formData = new URLSearchParams();
    formData.append('action', 'update');
    formData.append('label_id', label_id);
    formData.append('name_label', newName);

    const res = await fetch('label.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    return res.ok && (await res.json());
  }

  async function deleteLabel(label_id) {
    const formData = new URLSearchParams();
    formData.append('action', 'delete');
    formData.append('label_id', label_id);

    const res = await fetch('label.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    return res.ok && (await res.json());
  }
  // ----------------------------
  // 4. Gọi loadLabels lần đầu
  // ----------------------------
  await loadLabelsFromDB();

  // ----------------------------
  // 5. Sự kiện: Mở modal khi click nút "Add"
  // ----------------------------
  addLabelBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    renderModalLabels();
    input.focus();
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // ----------------------------
  // 6. Nhập nhãn mới bằng input
  // ----------------------------
input.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const newLabel = input.value.trim();

    // Kiểm tra tên nhãn đã tồn tại chưa
    if (!newLabel) {
      showMessage('Label name cannot be empty.');
      return;
    }
    if (labels.some(l => l.name_label.toLowerCase() === newLabel.toLowerCase())) {
      showMessage('Label name already exists.');
      return;
    }

    try {
      const success = await addLabelToDB(newLabel);
      if (success) {
        input.value = '';
        await loadLabelsFromDB();
        // location.reload();
      } else {
        showMessage('Failed to add label.');
      }
    } catch (error) {
      showMessage('Network or server error. Cannot add label while offline.');
    }
  }
});

  // ----------------------------
  // 7. Edit / Delete label
  // ----------------------------
 labellist.addEventListener('click', async (e) => {
  let target = e.target;

  if (!target.classList.contains('edit-label') && !target.classList.contains('delete-label')) {
    target = target.closest('.edit-label, .delete-label');
    if (!target) return;
  }

  const index = target.dataset.index;
  if (index === undefined) return;
  const labelObj = labels[index];

  // ✅ Xử lý XÓA
if (target.classList.contains('delete-label')) {
  const result = await Swal.fire({
    title: `Delete label "${labelObj.name_label}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
  });

  if (result.isConfirmed) {
    try {
      const response = await deleteLabel(labelObj.label_id);
      if (response.success) {
        await loadLabelsFromDB();
        location.reload();
      } else {
        showMessage('Delete label failed: ' + (response.error || 'Cannot delete'));
      }
    } catch (error) {
      showMessage('Network or server error. Cannot delete label while offline.');
    }
  }
  return; // Để không chạy tiếp sửa
}

  // ✅ Xử lý SỬA
 if (target.classList.contains('edit-label')) {
  const labelSpan = labellist.querySelector(`.label-name[data-index="${index}"]`);
  labelSpan.contentEditable = true;
  labelSpan.focus();

  const saveEdit = async () => {
    labelSpan.contentEditable = false;
    const newText = labelSpan.textContent.trim();

    if (!newText) {
      showMessage('Label name cannot be empty!');
      labelSpan.textContent = labelObj.name_label;
      labelSpan.focus();
      return;
    }

    // ✅ Check for duplicate name (except itself)
    const isDuplicate = labels.some((label, i) =>
      i !== parseInt(index) && label.name_label.toLowerCase() === newText.toLowerCase()
    );

    if (isDuplicate) {
      showMessage('Label name already exists!');
      labelSpan.textContent = labelObj.name_label;
      labelSpan.focus();
      return;
    }

    if (newText === labelObj.name_label) {
      labelSpan.textContent = labelObj.name_label;
      return;
    }

    try {
      const response = await updateLabel(labelObj.label_id, newText);
      if (response.success) {
        await loadLabelsFromDB();
        // location.reload();

      } else {
        // showMessage('Failed to update label on server. Please try again.');
        labelSpan.textContent = labelObj.name_label;
        labelSpan.focus();
      }
    } catch (error) {
      showMessage('Network or server error. Please try again later.');
      labelSpan.textContent = labelObj.name_label;
      labelSpan.focus();
    }
  };

  labelSpan.addEventListener('blur', saveEdit, { once: true });
  labelSpan.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEdit();
    }
  }, { once: true });
}
 });
});