document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const mainContent = document.querySelector('.main');
    const closeSidebar = document.querySelector('.close-sidebar');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Sidebar người dùng 
    const userIcon = document.querySelector(".bi-person-circle");
    const userDropdown = document.getElementById("userDropdown");
    const openPersonalInfoBtn = document.getElementById("openPersonalInfo");
    const personalInfoTab = document.getElementById("personalInfoTab");
    const closePersonalInfoBtn = document.querySelector(".close-personal-info");

    userIcon.addEventListener("click", () => {
        userDropdown.classList.toggle("active");
    });

    openPersonalInfoBtn.addEventListener("click", () => {
        personalInfoTab.classList.add("show");
        userDropdown.classList.add("hide");
    });
    closePersonalInfoBtn.addEventListener("click", () => {
        personalInfoTab.classList.remove("show");
    });

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


    // Khai báo biến chung
    const addNoteBar = document.querySelector('.add-note-bar');
    const addNoteExpanded = document.querySelector('.add-note-expanded');
    const addNoteInput = document.querySelector('.add-note-input');
    const closeBtn = document.querySelector('.close-add-note');
    const titleInput = document.querySelector('.note-title-input');
    const contentInput = document.querySelector('.note-content-input');
    let autosaveNoteId = null;
    let autosaveTimeout = null;

    // Hàm reset form note về trắng
    function resetAddNoteForm() {
        titleInput.value = '';
        contentInput.value = '';
        autosaveNoteId = null;
    }

    // Mở form tạo note
    window.expandAddNote = function () {
        addNoteBar.classList.add('hidden');
        addNoteExpanded.classList.remove('hidden');
        resetAddNoteForm();
        contentInput.focus();
    };

    // Đóng form khi click close
    closeBtn.addEventListener('click', function (e) {
        resetAddNoteForm();
        addNoteExpanded.classList.add('hidden');
        addNoteBar.classList.remove('hidden');
        e.stopPropagation();
    });

    // Đóng form khi click ngoài vùng note
    document.addEventListener('click', function (e) {
        if (
            !addNoteExpanded.classList.contains('hidden') &&
            !addNoteExpanded.contains(e.target) &&
            e.target !== addNoteInput
        ) {
            resetAddNoteForm();
            addNoteExpanded.classList.add('hidden');
            addNoteBar.classList.remove('hidden');
        }
    });

    // Autosave note khi nhập
    function triggerAutosave() {
        clearTimeout(autosaveTimeout);
        autosaveTimeout = setTimeout(() => {
            const title = titleInput.value.trim();
            const content = contentInput.value.trim();
            if (!title && !content) return;
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            if (autosaveNoteId) formData.append('note_id', autosaveNoteId);

            fetch('note.php', {
                method: 'POST',
                body: formData
            })
                .then(r => r.json())
                .then(data => {
                    if (data.note_id) autosaveNoteId = data.note_id;
                    fetchNotes();
                });
        }, 400);
    }
    titleInput.addEventListener('input', triggerAutosave);
    contentInput.addEventListener('input', triggerAutosave);


    function renderNotes(notes) {
        const container = document.querySelector('.notes');
        container.innerHTML = '';
        notes.forEach(note => {
            // Xác định class fill/active đúng cho từng icon
            let pinClass = note.pinned == 1 ? "bi-pin-angle-fill active" : "bi-pin-angle";
            let lockClass = note.locked == 1 ? "bi-lock-fill active" : "bi-lock";
            let shareClass = note.is_shared == 1 ? "bi-share-fill active" : "bi-share";
            let tagClass = note.has_label == 1 ? "bi-tag-fill active" : "bi-tag";
            // Nếu có icon nào active thì gắn show-icons
            let showIcons = (note.pinned == 1 || note.locked == 1 || note.is_shared == 1 || note.has_label == 1);
            let showIconsClass = showIcons ? " show-icons" : "";

            let noteHtml = `
            <div class="note${showIconsClass}" data-note-id="${note.note_id}">
                <div class="icons">  
                    <i class="bi bi-trash" data-action="delete"></i>
                    <i class="bi ${tagClass}" data-action="tag"></i>
                    <i class="bi ${lockClass}" data-action="lock"></i>
                    <i class="bi ${shareClass}" data-action="share"></i>
                    <i class="bi ${pinClass}" data-action="pin"></i>
                </div>
                <div class="content">
                ${
                    note.title && note.title.trim() !== ""
                    ? `<div class="title">${note.title}</div>
                   <div class="body">${note.content || ''}</div>`
                    : `<div class="title">${note.content || ''}</div>
                   <div class="body"></div>`
                }
        </div>
            </div>
        `;
            container.innerHTML += noteHtml;
        });

        attachIconEvents(); // gắn lại event cho icon
        attachNoteClickEvents(); // gắn lại event cho note để mở popup (nếu cần)
    }

    function attachIconEvents() {
        document.querySelectorAll('.icons i').forEach(icon => {
            icon.onclick = function (e) {
                e.stopPropagation();
                const noteDiv = this.closest('.note');
                const noteId = noteDiv.getAttribute('data-note-id');
                const action = this.dataset.action;
                if (action === 'delete') {
                    if (confirm("Xóa note này?")) {
                        // TODO: Thêm API xóa nếu cần
                    }
                    return;
                }
                fetch('note.php', {
                    method: 'POST',
                    body: new URLSearchParams({
                        action: 'toggle_icon',
                        note_id: noteId,
                        icon: action
                    })
                })
                    .then(r => r.json())
                    .then(() => fetchNotes()); // fetch lại để render đúng trạng thái, class
            }
        });
    }

    function attachNoteClickEvents() {
        document.querySelectorAll('.note').forEach(el => {
            el.addEventListener('click', function (e) {
                if (e.target.closest('.icons')) return;
                const noteId = el.getAttribute('data-note-id');
                fetch('note.php')
                    .then(r => r.json())
                    .then(notes => {
                        const note = notes.find(n => n.note_id == noteId);
                        if (note) showNoteModal(note);
                    });
            });
        });
    }




    function showNoteModal(note) {
        const popup = document.getElementById('popup-modal');
        const titleInput = document.getElementById('modal-title');
        const contentInput = document.getElementById('modal-content');
        if (!popup || !titleInput || !contentInput) {
            alert('Modal popup missing input or textarea with correct id!');
            return;
        }
        popup.classList.remove('hidden');
        titleInput.value = note.title || '';
        contentInput.value = note.content || '';
        titleInput.focus();

        let saveTimer = null;
        function autosaveModal() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                fetch('note.php', {
                    method: 'POST',
                    body: new URLSearchParams({
                        note_id: note.note_id,
                        title: titleInput.value,
                        content: contentInput.value
                    })
                }).then(r => r.json())
                    .then(data => fetchNotes());
            }, 400);
        }
        titleInput.oninput = autosaveModal;
        contentInput.oninput = autosaveModal;

        // Đóng popup khi bấm nút close
        document.getElementById('popup-close').onclick = hideModal;
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

//logout
document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            window.location.href = 'home.php?logout=1';
        });
    }
});
