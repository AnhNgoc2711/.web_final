// (() => {
//   let notes = [];
//   window.labels = []; // Global
//   window.selectedFilterLabelId = null; // Global

//   const filterLabelListEl = document.getElementById('labelList');
//   const notesContainer = document.querySelector('.notes');

//   // Nhận sự kiện khi label được cập nhật từ file khác (label.js)
//   document.addEventListener("labelsUpdated", (e) => {
//     window.labels = e.detail;
//     window.renderFilterLabels();
//   });

//   function showMessage(msg, duration = 3000) {
//     const msgBox = document.getElementById('messageBox');
//     const msgText = document.getElementById('messageText');
//     if (!msgBox || !msgText) return alert(msg);
//     msgText.textContent = msg;
//     msgBox.style.display = 'block';
//     setTimeout(() => (msgBox.style.display = 'none'), duration);
//   }

//   // Hiển thị danh sách ghi chú
//   // function renderFilteredNotes() {
//   //   if (!notesContainer) return;
//   //   notesContainer.innerHTML = '';

//   //   notes.forEach(note => {
//   //     let noteHtml = `
//   //       <div class="note" tabindex="0" aria-label="${note.title || note.content || 'note'}" data-note-id="${note.note_id}">
//   //         <div class="icons"></div>
//   //         <div class="content">
//   //           <p class="title">${note.title || note.content}</p>
//   //           <p class="body">${note.title ? note.content || '' : ''}</p>`;

//   //     if (Array.isArray(note.labels) && note.labels.length > 0) {
//   //       noteHtml += `<div class="note-labels" style="margin-top: 8px;">`;
//   //       note.labels.forEach(label => {
//   //         const labelName = typeof label === 'object' && label.name_label ? label.name_label : label;
//   //         noteHtml += `<span class="label" style="background:#eee;border-radius:12px;padding:4px 8px;font-size:0.8rem;margin-right:6px;display:inline-block;">${labelName}</span>`;
//   //       });
//   //       noteHtml += `</div>`;
//   //     }

//   //     noteHtml += `</div></div>`;
//   //     notesContainer.innerHTML += noteHtml;
//   //   });

//   //   document.querySelectorAll('.note').forEach(noteEl => {
//   //     noteEl.addEventListener('click', () => {
//   //       const noteId = noteEl.getAttribute('data-note-id');
//   //       const noteData = notes.find(n => n.note_id == noteId);
//   //       if (noteData) showNoteModal(noteData);
//   //     });
//   //   });
//   // }


//   (() => {
//     let notes = [];
//     window.labels = [];
//     window.selectedFilterLabelId = null;

//     const filterLabelListEl = document.getElementById('labelList');
//     const notesContainer = document.querySelector('.notes');

//     // Lấy các helper từ home.js
//     const generateNoteHTML = window.generateNoteHTML || (n => `<div class="note">${n.title}</div>`);
//     const attachIconEvents = window.attachIconEvents || (() => { });
//     const attachNoteClickEvents = window.attachNoteClickEvents || (() => { });

//     document.addEventListener("labelsUpdated", e => {
//       window.labels = e.detail;
//       renderFilterLabels();
//     });

//     function showMessage(msg, duration = 3000) { /*...*/ }

//     // === Hàm render lại theo đúng layout của trang chính ===
//     function renderFilteredNotes() {
//       if (!notesContainer) return;

//       // 1. Xóa cũ
//       notesContainer.innerHTML = '';

//       // 2. Bắt đầu wrapper
//       notesContainer.innerHTML = `
//       <div class="note-group">
//         <div class="note-list">
//           ${notes.map(note => generateNoteHTML(note)).join('')}
//         </div>
//       </div>
//     `;

//       // 3. Re-bind events & icons
//       attachIconEvents();
//       attachNoteClickEvents();
//     }

//     async function loadLabelsFromDB() { /*...*/ }

//     async function loadNotesByLabel(label_id = 0) {
//       try {
//         const res = await fetch(`get_note_labels.php?label_id=${label_id}`);
//         const data = await res.json();
//         if (data.success) {
//           notes = data.notes;
//           renderFilteredNotes();
//         } else {
//           showMessage("Không lấy được ghi chú");
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     }

//     function renderFilterLabels() { /*...*/ }
//     window.renderFilterLabels = renderFilterLabels;

//     document.addEventListener('DOMContentLoaded', () => {
//       loadLabelsFromDB();
//       loadNotesByLabel(0);
//     });
//   })();



//   function showNoteModal(note) {
//     const popup = document.getElementById('popup-modal');
//     const titleInput = document.getElementById('modal-title');
//     const contentInput = document.getElementById('modal-content');
//     const closeBtn = document.getElementById('popup-close');
//     if (!popup || !titleInput || !contentInput) return showMessage("Modal input missing");

//     window.currentNoteId = note.note_id;
//     popup.classList.remove('hidden');
//     titleInput.value = note.title || '';
//     contentInput.value = note.content || '';
//     titleInput.focus();

//     let saveTimer = null;
//     const autosave = () => {
//       clearTimeout(saveTimer);
//       saveTimer = setTimeout(() => {
//         if (!navigator.onLine) return showMessage("❌Connection lost, please check your network and try again.");
//         fetch('note_test.php', {
//           method: 'POST',
//           body: new URLSearchParams({
//             note_id: note.note_id,
//             title: titleInput.value,
//             content: contentInput.value
//           })
//         })
//           .then(r => r.json())
//           .then(() => saveLabelsForNote(note.note_id));
//       }, 400);
//     };

//     titleInput.oninput = autosave;
//     contentInput.oninput = autosave;
//     // Đóng popup khi bấm nút close
//     const popupCloseBtn = document.getElementById('popup-close');
//     if (popupCloseBtn) {
//       popupCloseBtn.onclick = hideModal;
//     }

//     // Đóng popup khi click ra ngoài vùng trắng
//     popup.onclick = function (e) {
//       if (e.target === popup) {
//         hideModal();
//       }
//     };

//     function hideModal() {
//       popup.classList.add('hidden');
//       fetchNotes();
//     }
//   }

//   async function loadLabelsFromDB() {
//     try {
//       const res = await fetch('label.php');
//       const data = await res.json();
//       if (data.success && Array.isArray(data.data)) {
//         window.labels = data.data;
//         window.renderFilterLabels();
//       } else {
//         showMessage("Lỗi tải nhãn từ server");
//       }
//     } catch (err) {
//       console.error(err);
//       showMessage("Lỗi mạng khi tải nhãn");
//     }
//   }

//   async function loadNotesByLabel(label_id = 0) {
//     try {
//       const res = await fetch(`get_note_labels.php?label_id=${label_id}`);
//       const data = await res.json();
//       if (data.success) {
//         notes = data.notes;
//         renderFilteredNotes();
//       } else {
//         showMessage("Không lấy được ghi chú");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   // ✅ HÀM NÀY ĐƯA RA GLOBAL
//   function renderFilterLabels() {
//     const filterLabelListEl = document.getElementById('labelList');
//     if (!filterLabelListEl) return;

//     filterLabelListEl.innerHTML = '';

//     const allLi = document.createElement('li');
//     allLi.textContent = 'All Notes';
//     allLi.style.cursor = 'pointer';
//     allLi.style.fontWeight = window.selectedFilterLabelId === null ? 'bold' : 'normal';
//     allLi.onclick = () => {
//       window.selectedFilterLabelId = null;
//       window.renderFilterLabels();
//       loadNotesByLabel(0);
//     };
//     filterLabelListEl.appendChild(allLi);

//     window.labels?.forEach(label => {
//       const li = document.createElement('li');
//       li.textContent = label.name_label;
//       li.style.cursor = 'pointer';
//       li.style.fontWeight = window.selectedFilterLabelId === label.label_id ? 'bold' : 'normal';
//       li.onclick = () => {
//         window.selectedFilterLabelId = label.label_id;
//         window.renderFilterLabels();
//         loadNotesByLabel(label.label_id);
//       };
//       filterLabelListEl.appendChild(li);
//     });
//   }

//   // Gán hàm ra global
//   window.renderFilterLabels = renderFilterLabels;

//   // Khởi động
//   document.addEventListener('DOMContentLoaded', () => {
//     loadLabelsFromDB();
//     loadNotesByLabel(0);
//   });
// })();


// filterNotesByLabel.js
(() => {
  let notes = [];
  window.labels = [];                    // đã có trong labels.js
  window.selectedFilterLabelId = null;   // để track label đang chọn

  const filterLabelListEl = document.getElementById('labelList');
  const notesContainer = document.querySelector('.notes');

  // Nhận event khi labels được cập nhật (labels.js trigger)
  document.addEventListener("labelsUpdated", e => {
    window.labels = e.detail;
    renderFilterLabels();
  });

  // Hiển thị list labels ở sidebar
  function renderFilterLabels() {
    if (!filterLabelListEl) return;
    filterLabelListEl.innerHTML = '';

    // All Notes
    const allLi = document.createElement('li');
    allLi.textContent = 'All Notes';
    allLi.style.cursor = 'pointer';
    allLi.style.fontWeight = window.selectedFilterLabelId === null ? 'bold' : 'normal';
    allLi.onclick = () => {
      window.selectedFilterLabelId = null;
      renderFilterLabels();
      loadNotesByLabel(0);
    };
    filterLabelListEl.appendChild(allLi);

    // Các label còn lại
    window.labels.forEach(label => {
      const li = document.createElement('li');
      li.textContent = label.name_label;
      li.style.cursor = 'pointer';
      li.style.fontWeight = window.selectedFilterLabelId === label.label_id ? 'bold' : 'normal';
      li.onclick = () => {
        window.selectedFilterLabelId = label.label_id;
        renderFilterLabels();
        loadNotesByLabel(label.label_id);
      };
      filterLabelListEl.appendChild(li);
    });
  }
  window.renderFilterLabels = renderFilterLabels;

  // Load notes từ server theo label
  async function loadNotesByLabel(label_id = 0) {
    try {
      const res = await fetch(`get_note_labels.php?label_id=${label_id}`);
      const data = await res.json();
      if (data.success) {
        notes = data.notes;
        renderFilteredNotes();
      } else {
        alert("Không lấy được ghi chú");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi mạng khi tải ghi chú");
    }
  }

  // Hàm render chính — dùng wrapper và helper từ home.js
  function renderFilteredNotes() {
    if (!notesContainer) return;

    // Bọc wrapper note-group → note-list
    const html = `
      <div class="note-group">
        <div class="note-list">
          ${notes.map(n => window.generateNoteHTML(n)).join('')}
        </div>
      </div>
    `;
    notesContainer.innerHTML = html;

    // Re-bind icon & click events (pin/share/tag/modal…)
    window.attachIconEvents();
    window.attachNoteClickEvents();
  }

  // Khởi tạo khi DOM xong
  document.addEventListener('DOMContentLoaded', () => {
    renderFilterLabels();
    loadNotesByLabel(0);  // load all notes lần đầu
  });
})();
