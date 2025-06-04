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
        renderLabels();
        renderModalLabels();
      } else {
        showMessage('Lỗi khi tải nhãn: ' + (data.error || 'Dữ liệu không hợp lệ'));
        labels = [];
        renderLabels();
        renderModalLabels();
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
      if (newLabel && !labels.some(l => l.name_label === newLabel)) {
        const success = await addLabelToDB(newLabel);
        if (success) {
          input.value = '';
          await loadLabelsFromDB();
        } else {
          showMessage('Lỗi thêm nhãn!');
        }
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
      title: `Xóa nhãn "${labelObj.name_label}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      const response = await deleteLabel(labelObj.label_id);
      if (response.success) {
        await loadLabelsFromDB();
      } else {
        showMessage('Lỗi xóa nhãn: ' + (response.error || 'Không thể xóa'));
      }
    }
    return; // ❗Đảm bảo không chạy tiếp phần "sửa"
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
      showMessage('Tên nhãn không được để trống!');
      labelSpan.textContent = labelObj.name_label;
      labelSpan.focus();
      return;
    }

    // ✅ Kiểm tra trùng tên (khác chính nó)
    const isDuplicate = labels.some((label, i) =>
      i !== parseInt(index) && label.name_label.toLowerCase() === newText.toLowerCase()
    );

    if (isDuplicate) {
      showMessage('Tên nhãn đã tồn tại!');
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
      } else {
        labelSpan.textContent = labelObj.name_label;
        labelSpan.focus();
      }
    } catch (error) {
      showMessage('Lỗi mạng hoặc server, vui lòng thử lại.');
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