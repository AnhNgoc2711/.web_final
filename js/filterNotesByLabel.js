(() => {
  let notes = [];
  let labels = [];
  let selectedFilterLabelId = null;

  const filterLabelListEl = document.getElementById('labelList');
  const selectedLabelsDiv = document.querySelector('.notes');

  function openNoteModal(noteId) {
    const note = notes.find(n => n.note_id == noteId);
    if (!note) return;

    const modal = document.getElementById('popup-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    if (modal && modalTitle && modalContent) {
        modalTitle.value = note.title || '';
        modalContent.value = note.content || '';

        modal.classList.remove('hidden');
        modal.style.display = 'block';
    }
  }


  function showMessage(msg, duration = 3000) {
  const msgBox = document.getElementById('messageBox');
  const msgText = document.getElementById('messageText');
  if (!msgBox || !msgText) {
    alert(msg); // fallback nếu chưa có hộp message trong HTML
    return;
  }
  msgText.textContent = msg;
  msgBox.style.display = 'block';
  setTimeout(() => {
    msgBox.style.display = 'none';
  }, duration);
}


  function renderFilteredNotes() {
   const container = document.querySelector('.notes');
    if (!container) return;
    container.innerHTML = '';

     notes.forEach(note => {
        let noteHtml = `
            <div class="note" tabindex="0" aria-label="${note.title || note.content || 'note'}" data-note-id="${note.note_id}">
                <div class="icons"></div>
                <div class="content">
        `;

        if (note.title && note.title.trim() !== "") {
            noteHtml += `<p class="title">${note.title}</p>`;
            noteHtml += `<p class="body">${note.content || ''}</p>`;
        } else {
            noteHtml += `<p class="title">${note.content || ''}</p>`;
            noteHtml += `<p class="body"></p>`;
        }

       if (note.labels && Array.isArray(note.labels) && note.labels.length > 0) {
        // chỉ chạy đoạn này nếu note.labels tồn tại và có ít nhất 1 nhãn
        noteHtml += `<div class="note-labels" style="margin-top: 8px;">`;
        note.labels.forEach(label => {
            const labelName = typeof label === 'object' && label.name_label ? label.name_label : label;
            noteHtml += `
                <span class="label" style="
                    background-color: #eee;
                    border-radius: 12px;
                    padding: 4px 8px;
                    font-size: 0.8rem;
                    margin-right: 6px;
                    display: inline-block;
                ">${labelName}</span>
            `;
        });
        noteHtml += `</div>`;
        }
        noteHtml += `
                </div>
            </div>
        `;
        container.innerHTML += noteHtml;
    });

    document.querySelectorAll('.note').forEach(noteEl => {
        noteEl.addEventListener('click', () => {
            const noteId = noteEl.getAttribute('data-note-id');
            const noteData = notes.find(n => n.note_id == noteId);
            if (noteData) {
                showNoteModal(noteData);
                // autosaveModal();
            }
        });
    });
    // Gắn sự kiện mở modal khi click ghi chú
        function showNoteModal(note) {
        console.log('saveLabelsForNote called for note_id:', note.note_id);
        const popup = document.getElementById('popup-modal');
        const titleInputModal = document.getElementById('modal-title');
        const contentInputModal = document.getElementById('modal-content');
        // const selectedLabelsContainer = document.getElementById('selected-labels');
        window.currentNoteId = note.note_id;

        if (!popup || !titleInputModal || !contentInputModal) {
            showMessage('Modal popup missing input or textarea with correct id!');
            return;
        }
        popup.classList.remove('hidden');
        titleInputModal.value = note.title || '';
        contentInputModal.value = note.content || '';

        titleInputModal.focus();

        let saveTimerModal = null;

        function autosaveModal() {
            clearTimeout(saveTimerModal);
            saveTimerModal = setTimeout(() => {
                if (!navigator.onLine) {
                    showMessage("❌ Connection lost, please check your network and try again.");
                    return; // Stop the function, do not save anything
                }
                fetch('note_test.php', {
                    method: 'POST',
                    body: new URLSearchParams({
                        note_id: note.note_id,
                        title: titleInputModal.value,
                        content: contentInputModal.value
                    })
                }).then(r => r.json())
                .then(data => {
                    // fetchNotes();
                    saveLabelsForNote(note.note_id);
                });

            }, 400);
        }


        titleInputModal.oninput = autosaveModal;
        contentInputModal.oninput = autosaveModal;

        // Đóng popup khi bấm nút close
        const popupCloseBtn = document.getElementById('popup-close');
        if (popupCloseBtn) {
            popupCloseBtn.onclick = hideModal;
        }

        // Đóng popup khi click ra ngoài vùng trắng
        popup.onclick = function (e) {
            if (e.target === popup) {
                hideModal();
            }
        };

        function hideModal() {
            popup.classList.add('hidden');
        }
    }
  }

 async function loadLabelsFromDB() {
    try {
      const res = await fetch('label.php');
      const data = await res.json();
      console.log("Dữ liệu trả về từ label.php:", data);

      if (data.success && Array.isArray(data.data)) {
        labels = data.data;
        renderFilterLabels();
      } else {
        console.error('Dữ liệu không đúng định dạng:', data);
        showMessage('Lỗi tải nhãn từ server');
      }
    } catch (e) {
      console.error('Lỗi fetch nhãn:', e);
      showMessage('Lỗi mạng khi tải nhãn');
    }
}
let hasLoadedAllNotes = false;
  async function loadNotesByLabel(label_id = 0) {
    if (label_id === 0 && hasLoadedAllNotes) {
    // Đã load rồi, không gọi lại nữa
    return;
  }
    try {
      const url = `get_note_labels.php?label_id=${label_id}`;
      const res = await fetch(url);
      const data = await res.json();
      // console.log("Response từ API:", data);
      if (data.success) {
        notes = data.notes;
        renderFilteredNotes();
      } else {
        console.error(data.message || 'Lỗi tải ghi chú');
      }
    } catch (error) {
      console.error('Lỗi khi fetch ghi chú:', error);
    }
  }

  function renderFilterLabels() {
  filterLabelListEl.innerHTML = '';

  const allLi = document.createElement('li');
  allLi.textContent = 'All Notes';
  allLi.style.cursor = 'pointer';
  allLi.style.fontWeight = selectedFilterLabelId === null ? 'bold' : 'normal';
  allLi.onclick = () => {
    selectedFilterLabelId = null;
    renderFilterLabels();
    loadNotesByLabel(0); // label_id = 0 => tất cả
  };
  filterLabelListEl.appendChild(allLi);

  labels.forEach(label => {
    const li = document.createElement('li');
    li.textContent = label.name_label;
    li.style.cursor = 'pointer';
    li.style.fontWeight = selectedFilterLabelId === label.label_id ? 'bold' : 'normal';

    li.onclick = () => {
      console.log('Click label:', label.name_label, label.label_id);
      selectedFilterLabelId = label.label_id;
      renderFilterLabels();
      loadNotesByLabel(label.label_id);
    };

    filterLabelListEl.appendChild(li);
  });
}


  document.addEventListener('DOMContentLoaded', () => {
    loadLabelsFromDB().then(() => {
      renderFilterLabels();
    });

    loadNotesByLabel(0); // Gọi lần đầu để hiển thị tất cả
  });
})();
