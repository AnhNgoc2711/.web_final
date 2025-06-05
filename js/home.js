

document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const mainContent = document.querySelector('.main');
    const closeSidebar = document.querySelector('.close-sidebar');

    function showMessage(msg, duration = 3000) {
    const msgBox = document.getElementById('messageBox');
    const msgText = document.getElementById('messageText');
    msgText.textContent = msg;
    msgBox.style.display = 'block';

  setTimeout(() => {
    msgBox.style.display = 'none';
  }, duration);
}


    // Sidebar chính
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    // Sidebar người dùng
    const userIcon = document.querySelector(".bi-person-circle");
    const userDropdown = document.getElementById("userDropdown");
    const openPersonalInfoBtn = document.getElementById("openPersonalInfo");
    const personalInfoTab = document.getElementById("personalInfoTab");
    const closePersonalInfoBtn = document.querySelector(".close-personal-info");

    if (userIcon && userDropdown) {
        userIcon.addEventListener("click", () => {
            userDropdown.classList.toggle("active");
        });
    }
    if (openPersonalInfoBtn && personalInfoTab && userDropdown) {
        openPersonalInfoBtn.addEventListener("click", () => {
            personalInfoTab.classList.add("show");
            userDropdown.classList.add("hide");
        });
    }
    if (closePersonalInfoBtn && personalInfoTab) {
        closePersonalInfoBtn.addEventListener("click", () => {
            personalInfoTab.classList.remove("show");
            userDropdown.classList.remove("hide");
        });
    }

    // Toggle grid/list view
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    const notesContainer = document.querySelector('.notes');
    if (toggleViewBtn && notesContainer) {
        toggleViewBtn.addEventListener('click', () => {
            notesContainer.classList.toggle('list-view');
            notesContainer.classList.toggle('grid-view');
            if (notesContainer.classList.contains('list-view')) {
                toggleViewBtn.classList.replace('bi-list-task', 'bi-grid-3x3-gap');
                toggleViewBtn.setAttribute('title', 'Grid view');
            } else {
                toggleViewBtn.classList.replace('bi-grid-3x3-gap', 'bi-list-task');
                toggleViewBtn.setAttribute('title', 'List view');
            }
        });
    }

    // Add new note
    const addNoteBar = document.querySelector('.add-note-bar');
    const addNoteExpanded = document.querySelector('.add-note-expanded');
    const addNoteInput = document.querySelector('.add-note-input');
    const closeBtn = document.querySelector('.close-add-note');
    const titleInput = document.querySelector('.note-title-input');
    const contentInput = document.querySelector('.note-content-input');

    let autosaveNoteId = null;
    let saveTimer = null; // Định nghĩa biến saveTimer để dùng cho autosave

    // Hàm reset form note về trắng
    function resetAddNoteForm() {
        if (titleInput) titleInput.value = '';
        if (contentInput) contentInput.value = '';
        autosaveNoteId = null;
    }

    // Mở form tạo note
    window.expandAddNote = function () {
        if (addNoteBar && addNoteExpanded) {
            addNoteBar.classList.add('hidden');
            addNoteExpanded.classList.remove('hidden');
            resetAddNoteForm();
            if (contentInput) contentInput.focus();
        }
    };

    // Đóng form khi click close
    if (closeBtn && addNoteExpanded && addNoteBar) {
        closeBtn.addEventListener('click', function (e) {
            resetAddNoteForm();
            addNoteExpanded.classList.add('hidden');
            addNoteBar.classList.remove('hidden');
            e.stopPropagation();
        });
    }

    // Đóng form khi click ngoài vùng note
    document.addEventListener('click', function (e) {
        if (
            addNoteExpanded &&
            !addNoteExpanded.classList.contains('hidden') &&
            !addNoteExpanded.contains(e.target) &&
            e.target !== addNoteInput
        ) {
            resetAddNoteForm();
            addNoteExpanded.classList.add('hidden');
            if (addNoteBar) addNoteBar.classList.remove('hidden');
        }
    });

    // Global biến tạm để giữ note đang mở popup
    let openedNote = null;

    // Autosave note khi nhập
    function triggerAutosave() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            const selectedLabels = [];
            const checkboxes = document.querySelectorAll('#label-selection input[type="checkbox"]:checked');
            checkboxes.forEach(cb => selectedLabels.push(cb.value));

            fetch('note.php', {
                method: 'POST',
                body: new URLSearchParams({
                    note_id: openedNote ? openedNote.note_id : '',
                    title: titleInput ? titleInput.value : '',
                    content: contentInput ? contentInput.value : '',
                    labels: JSON.stringify(selectedLabels)
                })
            }).then(r => r.json())
                .then(data => fetchNotes());
        }, 400);
    }

    if (titleInput) titleInput.addEventListener('input', triggerAutosave);
    if (contentInput) contentInput.addEventListener('input', triggerAutosave);

    // Hiển thị danh sách note
    function renderNotes(notes) {
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

    // Gắn event cho tất cả note
    document.querySelectorAll('.note').forEach(el => {
        el.addEventListener('click', function () {
            const noteId = el.getAttribute('data-note-id');
            const note = notes.find(n => n.note_id == noteId);
            if (!note) return;
            window.currentNoteId = note.note_id;
            openedNote = note;
            showNoteModal(note);
        });
    });
}
    function saveLabelsForNote(note_id) {
    // Giả sử bạn có checkbox đã lấy sẵn selectedLabels
    const checkboxes = document.querySelectorAll('#label-selection input[type="checkbox"]:checked');
    const selectedLabels = Array.from(checkboxes).map(cb => cb.value);

    console.log("Selected labels:", selectedLabels);

    fetch('note_label.php', {
    method: 'POST',
    body: new URLSearchParams({
        action: 'save_labels',
        note_id: note_id,
        labels: JSON.stringify(selectedLabels)
    })
})
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log("Labels saved successfully");
        } else {
            console.error("Failed to save labels");
        }
    })
    .catch(err => console.error("Error saving labels:", err));
}

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
                fetch('note.php', {
                    method: 'POST',
                    body: new URLSearchParams({
                        note_id: note.note_id,
                        title: titleInputModal.value,
                        content: contentInputModal.value
                    })
                }).then(r => r.json())
                .then(data => {
                    fetchNotes();
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
            fetchNotes();
        }
    }

    // Lấy danh sách note từ API
    function fetchNotes() {
        fetch('note.php')
            .then(r => r.json())
            .then(renderNotes);
    }

    // Gọi khi load trang
    fetchNotes();
});
