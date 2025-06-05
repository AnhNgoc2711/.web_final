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

    const toggleViewBtn = document.getElementById('toggleViewBtn');
    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', function () {
            document.querySelectorAll('.note-list').forEach(list => {
                list.classList.toggle('list-view');
                list.classList.toggle('grid-view');
            });
            // Đổi icon toggle
            if (document.querySelector('.note-list.list-view')) {
                toggleViewBtn.classList.replace('bi-list-task', 'bi-grid-3x3-gap');
            } else {
                toggleViewBtn.classList.replace('bi-grid-3x3-gap', 'bi-list-task');
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


    // Render icon ngoài card
    function generateCardIconsHTML(note) {
        return `
        <i class="bi bi-trash" data-action="delete"></i>
        <i class="bi ${note.has_label == 1 ? "bi-tag-fill active" : "bi-tag"}" data-action="tag"></i>
        <i class="bi ${note.locked == 1 ? "bi-lock-fill active" : "bi-lock"}" data-action="lock"></i>
        <i class="bi ${note.is_shared == 1 ? "bi-share-fill active" : "bi-share"}" data-action="share"></i>
        <i class="bi ${note.pinned == 1 ? "bi-pin-angle-fill active" : "bi-pin-angle"}" data-action="pin"></i>
    `;
    }

    // Render icon trong popup
    function generatePopupIconsHTML(state) {
        // Nếu dùng icon màu xanh/hover xanh thì viết class ở đây
        return `
        <i class="bi bi-type${state.size_type == 1 ? " active" : ""}" data-action="font"></i>
        <i class="bi bi-image${state.has_image == 1 ? " active" : ""}" data-action="image"></i>
        <i class="bi bi-palette${state.has_color == 1 ? " active" : ""}" data-action="palette"></i>
        <i class="bi ${state.pinned == 1 ? "bi-pin-angle-fill active" : "bi-pin-angle"}" data-action="pin"></i>
        <i class="bi ${state.is_shared == 1 ? "bi-share-fill active" : "bi-share"}" data-action="share"></i>
        <i class="bi ${state.locked == 1 ? "bi-lock-fill active" : "bi-lock"}" data-action="lock"></i>
        <i class="bi ${state.has_label == 1 ? "bi-tag-fill active" : "bi-tag"}" data-action="tag"></i>
    `;
    }


    let newNoteIconState = { pinned: 0, locked: 0, is_shared: 0, has_label: 0 };

    function showCreateNoteModal() {
        const popup = document.getElementById('popup-modal');
        const titleInput = document.getElementById('modal-title');
        const contentInput = document.getElementById('modal-content');
        const iconsDiv = popup.querySelector('.icons');

        // Render icon popup theo trạng thái tạm
        function updateIcons() {
            iconsDiv.innerHTML = generatePopupIconsHTML(newNoteIconState);
            iconsDiv.querySelectorAll('i').forEach(icon => {
                icon.onclick = function (e) {
                    e.stopPropagation();
                    const action = this.dataset.action;
                    if (action === 'pin') newNoteIconState.pinned ^= 1;
                    if (action === 'lock') newNoteIconState.locked ^= 1;
                    if (action === 'share') newNoteIconState.is_shared ^= 1;
                    if (action === 'tag') newNoteIconState.has_label ^= 1;
                    updateIcons(); // chỉ render lại icon thôi
                }
            });
        }
        updateIcons();

        // Hiện popup, reset input
        popup.classList.remove('hidden');
        titleInput.value = '';
        contentInput.value = '';
        titleInput.focus();

        // Autosave dữ liệu tạo note mới
        let saveTimer = null;
        function autosaveCreateNote() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                const title = titleInput.value.trim();
                const content = contentInput.value.trim();
                if (!title && !content) return;
                const formData = new FormData();
                formData.append('title', title);
                formData.append('content', content);
                formData.append('pinned', newNoteIconState.pinned);
                formData.append('locked', newNoteIconState.locked);
                formData.append('is_shared', newNoteIconState.is_shared);
                formData.append('has_label', newNoteIconState.has_label);

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
        titleInput.oninput = autosaveCreateNote;
        contentInput.oninput = autosaveCreateNote;

        // Đóng popup
        document.getElementById('popup-close').onclick = hideCreateModal;
        popup.onclick = function (e) {
            if (e.target === popup) hideCreateModal();
        };
        function hideCreateModal() {
            popup.classList.add('hidden');
            autosaveNoteId = null;
            newNoteIconState = { pinned: 0, locked: 0, is_shared: 0, has_label: 0 };
        }
    }


    // show popup chỉnh note
    function showNoteModal(note) {
        const popup = document.getElementById('popup-modal');
        const titleInput = document.getElementById('modal-title');
        const contentInput = document.getElementById('modal-content');
        const iconsDiv = popup.querySelector('.icons');
        popup.classList.remove('hidden');

        titleInput.value = note.title || '';
        contentInput.value = note.content || '';
        titleInput.focus(); 
        
        // Sao chép trạng thái ban đầu để render icon mượt mà (không phụ thuộc tham chiếu note)
        let iconState = {
            pinned: note.pinned || 0,
            locked: note.locked || 0,
            is_shared: note.is_shared || 0,
            has_label: note.has_label || 0
        };

        function updateIcons() {
            iconsDiv.innerHTML = generatePopupIconsHTML(iconState);

            iconsDiv.querySelectorAll('i').forEach(icon => {
                icon.onclick = function (e) {
                    e.stopPropagation();
                    const action = this.dataset.action;
                    // Toggle trạng thái local
                    if (action === 'pin') iconState.pinned ^= 1;
                    if (action === 'lock') iconState.locked ^= 1;
                    if (action === 'share') iconState.is_shared ^= 1;
                    if (action === 'tag') iconState.has_label ^= 1;

                    // Gọi API cập nhật DB
                    fetch('note.php', {
                        method: 'POST',
                        body: new URLSearchParams({
                            action: 'toggle_icon',
                            note_id: note.note_id,
                            icon: action
                        })
                    })
                        .then(r => r.json())
                        .then(() => {
                            // Lấy lại trạng thái note mới nhất sau khi cập nhật DB
                            fetch('note.php')
                                .then(r => r.json())
                                .then(notes => {
                                    const updated = notes.find(n => n.note_id == note.note_id);
                                    if (updated) {
                                        // Update lại iconState với trạng thái DB mới nhất
                                        iconState = {
                                            pinned: updated.pinned || 0,
                                            locked: updated.locked || 0,
                                            is_shared: updated.is_shared || 0,
                                            has_label: updated.has_label || 0
                                        };
                                        updateIcons();
                                    }
                                });
                            fetchNotes(); // Render lại list ngoài
                        });
                };
            });
        }
        updateIcons();


        // Autosave nội dung note
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

        // Đóng popup
        document.getElementById('popup-close').onclick = hideEditModal;
        popup.onclick = function (e) {
            if (e.target === popup) hideEditModal();
        };
        function hideEditModal() {
            popup.classList.add('hidden');
        }

    }


    function renderNotes(notes) {
        const container = document.querySelector('.notes');
        if (!container) return;

        // Tách note thành 2 nhóm, ép kiểu string
        const pinnedNotes = notes.filter(n => String(n.pinned) === '1');
        const normalNotes = notes.filter(n => String(n.pinned) === '0');

        let html = "";

        // Nhóm note được pin
        if (pinnedNotes.length > 0) {
            html += `
        <div class="note-group">
            <div class="note-group-title">PINNED</div>
            <div class="note-list">
                ${pinnedNotes.map(note => generateNoteHTML(note)).join('')}
            </div>
        </div>
        `;
        }

        // Nhóm note bình thường
        if (normalNotes.length > 0) {
            html += `
        <div class="note-group">
            <div class="note-group-title">MY NOTES</div>
            <div class="note-list">
                ${normalNotes.map(note => generateNoteHTML(note)).join('')}
            </div>
        </div>
        `;
        }

        container.innerHTML = html;

        attachIconEvents();
        attachNoteClickEvents();
    }



    function generateNoteHTML(note) {
        if (note.title && note.title.trim() !== "") {
            return `
                <div class="note" data-note-id="${note.note_id}">
                    <div class="icons">
                        ${generateCardIconsHTML(note)}
                    </div>
                    <div class="content">
                        <div class="title">${note.title}</div>
                        <div class="body">${note.content || ''}</div>
                    </div>
                </div>
                `;
        } else {
            return `
                <div class="note" data-note-id="${note.note_id}">
                    <div class="icons">
                        ${generateCardIconsHTML(note)}
                    </div>
                    <div class="content">
                        <div class="title">${note.content || ''}</div>
                        <div class="body"></div>
                    </div>
                </div>
                `;
        }
    }




    function attachIconEvents() {
        document.querySelectorAll('.notes .icons i').forEach(icon => {
            icon.onclick = function (e) {
                e.stopPropagation();
                const noteDiv = this.closest('.note');
                if (!noteDiv) return; // phòng ngừa bug
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
                if (e.target.closest('.icons')) return; // Không mở popup khi click icon
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


    // Lấy danh sách note từ API
    function fetchNotes() {
        fetch('note.php')
            .then(r => r.json())
            .then(renderNotes);
    }


    // Gọi khi load trang
    fetchNotes();


    //Logout 
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            window.location.href = 'home.php?logout=1';
        });
    }
});
