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
        return `
        <span class="size-type-wrapper" style="position:relative;display:inline-block">
          <i class="bi bi-type${state.size_type ? " active" : ""}" data-action="size"></i>
          <div class="size-type-popup hidden">
            <div data-size="H1" class="size-option${state.size_type === 'H1' ? ' active' : ''}">H1</div>
            <div data-size="H2" class="size-option${(!state.size_type || state.size_type === 'H2') ? ' active' : ''}">H2</div>
            <div data-size="H3" class="size-option${state.size_type === 'H3' ? ' active' : ''}">H3</div>
          </div>
        </span>
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
        let newNoteIconState = { pinned: 0, locked: 0, is_shared: 0, has_label: 0 };
        let autosaveNoteId = null; // biến này được gán sau khi lần autosave đầu tiên trả về note_id

        function updateIcons() {
            iconsDiv.innerHTML = generatePopupIconsHTML(newNoteIconState);
            const sizeWrapper = iconsDiv.querySelector('.size-type-wrapper');
            if (sizeWrapper) {
                const sizeIcon = sizeWrapper.querySelector('i[data-action="size"]');
                const sizePopup = sizeWrapper.querySelector('.size-type-popup');
                if (sizeIcon && sizePopup) {
                    // Khi click vào icon “Aa”
                    sizeIcon.onclick = function (e) {
                        e.stopPropagation();
                        sizePopup.classList.toggle('hidden');
                    };

                    // Đóng popup nếu click ra ngoài
                    document.addEventListener('mousedown', function handler(evt) {
                        if (
                            !sizePopup.classList.contains('hidden') &&
                            !sizePopup.contains(evt.target) &&
                            evt.target !== sizeIcon
                        ) {
                            sizePopup.classList.add('hidden');
                            document.removeEventListener('mousedown', handler);
                        }
                    });

                    // **Sửa ở đây**: dùng autosaveNoteId thay cho note.note_id
                    sizePopup.querySelectorAll('.size-option').forEach(opt => {
                        opt.onclick = function (e) {
                            e.stopPropagation();
                            const size = this.dataset.size;
                            // Nếu autosaveNoteId chưa set (chưa tạo note lần nào), ta không làm gì
                            if (!autosaveNoteId) return;

                            fetch('note.php', {
                                method: 'POST',
                                body: new URLSearchParams({
                                    action: 'set_size_type',
                                    note_id: autosaveNoteId,
                                    size_type: size
                                })
                            })
                                .then(r => r.json())
                                .then(() => {
                                    sizePopup.classList.add('hidden');
                                    fetchNotes();
                                })
                                .catch(console.error);
                        };
                    });
                }
            }

            // Phần bind event cho pin/lock/share/tag vẫn giữ nguyên
            iconsDiv.querySelectorAll('i[data-action]').forEach(icon => {
                const action = icon.dataset.action;
                if (action === 'size') return; // không đụng tới “size” nữa vì đã bind bên trên
                icon.onclick = function (e) {
                    e.stopPropagation();
                    if (action === 'pin') newNoteIconState.pinned ^= 1;
                    if (action === 'lock') newNoteIconState.locked ^= 1;
                    if (action === 'share') newNoteIconState.is_shared ^= 1;
                    if (action === 'tag') newNoteIconState.has_label ^= 1;
                    updateIcons();
                };
            });
        }

        updateIcons();
        popup.classList.remove('hidden');
        titleInput.value = '';
        contentInput.value = '';


        // === BỔ SUNG: Khi mới mở modal, chưa có chọn size nào, ta có thể reset class size cũ ===
        contentInput.classList.remove('size-h1', 'size-h2', 'size-h3');
        // (Nếu muốn mặc định H2 thì thêm:) contentInput.classList.add('size-h2');


        // Autosave – gán autosaveNoteId khi server trả về note_id
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
                        if (data.note_id) {
                            autosaveNoteId = data.note_id;
                        }
                        fetchNotes();
                    })
                    .catch(console.error);
            }, 400);
        }
        titleInput.oninput = autosaveCreateNote;
        contentInput.oninput = autosaveCreateNote;

        // Đóng modal tạo note
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
        popup.setAttribute('data-note-id', note.note_id);

        const titleInput = document.getElementById('modal-title');
        const contentInput = document.getElementById('modal-content');
        const iconsDiv = popup.querySelector('.icons');

        popup.classList.remove('hidden');
        titleInput.value = note.title || '';
        contentInput.value = note.content || '';
        titleInput.focus();

        let iconState = {
            pinned: note.pinned || 0,
            locked: note.locked || 0,
            is_shared: note.is_shared || 0,
            has_label: note.has_label || 0,
            size_type: note.size_type || 'H2'
        };


        // === BỔ SUNG 1: Khi mở modal, gán ngay class size cho textarea ===
        contentInput.classList.remove('size-h1', 'size-h2', 'size-h3');
        contentInput.classList.add('size-' + iconState.size_type.toLowerCase());
        // === KẾT THÚC BỔ SUNG 1 ===

        function updateIcons() {
            iconsDiv.innerHTML = generatePopupIconsHTML(iconState);

            const sizeTypeWrapper = iconsDiv.querySelector('.size-type-wrapper');
            if (sizeTypeWrapper) {
                const sizeIcon = sizeTypeWrapper.querySelector('i[data-action="size"]');
                const sizePopup = sizeTypeWrapper.querySelector('.size-type-popup');

                if (sizeIcon && sizePopup) {
                    // Khi click vào icon size, chỉ hiện/ẩn popup
                    sizeIcon.onclick = function (e) {
                        e.stopPropagation();
                        sizePopup.classList.toggle('hidden');
                    };

                    // Nếu click bất kỳ chỗ nào bên ngoài popup, ẩn đi
                    document.addEventListener('click', function onClickOutside(e) {
                        if (
                            !sizePopup.classList.contains('hidden') &&
                            !sizePopup.contains(e.target) &&
                            e.target !== sizeIcon
                        ) {
                            sizePopup.classList.add('hidden');
                            document.removeEventListener('click', onClickOutside);
                        }
                    });


                    sizePopup.querySelectorAll('.size-option').forEach(opt => {
                        opt.onclick = function (e) {
                            e.stopPropagation();
                            const newSize = this.dataset.size; // “H1” hoặc “H2” hoặc “H3”

                            // === BỔ SUNG 2: Gán class ngay cho <textarea id="modal-content">
                            contentInput.classList.remove('size-h1', 'size-h2', 'size-h3');
                            contentInput.classList.add('size-' + newSize.toLowerCase());
                            // === KẾT THÚC BỔ SUNG 2 ===

                            fetch('note.php', {
                                method: 'POST',
                                body: new URLSearchParams({
                                    action: 'set_size_type',
                                    note_id: note.note_id,
                                    size_type: newSize
                                })
                            })
                                .then(r => r.json())
                                .then(res => {
                                    // Bạn có thể log để debug:
                                    console.log('set_size_type response:', res);
                                    // Ẩn popup
                                    sizePopup.classList.add('hidden');
                                    // Cập nhật lại iconState để render lại đúng icon (nếu cần)
                                    iconState.size_type = newSize;
                                    updateIcons();   // render lại icon với size mới
                                    // Lấy lại danh sách note để hiển thị size mới
                                    fetchNotes();
                                })
                                .catch(err => {
                                    console.error('Lỗi khi set_size_type:', err);
                                });
                        };
                    });
                }
            }


            // 3. Gán sự kiện cho các icon pin/lock/share/tag (loại trừ icon size)
            iconsDiv.querySelectorAll('i[data-action]').forEach(icon => {
                const action = icon.dataset.action;
                if (action === 'size') return; // Bỏ qua, vì đã gán riêng bên trên

                icon.onclick = function (e) {
                    e.stopPropagation();
                    fetch('note.php', {
                        method: 'POST',
                        body: new URLSearchParams({
                            action: 'toggle_icon',
                            note_id: note.note_id,
                            icon: action
                        })
                    })
                        .then(r => r.json())
                        .then(res => {
                            console.log('toggle_icon response:', res);
                            // Sau khi toggle icon xong, cập nhật lại trạng thái iconState và render lại
                            if (action === 'pin') iconState.pinned ^= 1;
                            else if (action === 'lock') iconState.locked ^= 1;
                            else if (action === 'share') iconState.is_shared ^= 1;
                            else if (action === 'tag') iconState.has_label ^= 1;
                            updateIcons();
                            fetchNotes();
                        })
                        .catch(err => {
                            console.error('Lỗi khi toggle_icon:', err);
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
                    <div class="body size-${(note.size_type || 'H2').toLowerCase()}">${note.content || ''}</div>
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
                    <div class="body size-${(note.size_type || 'H2').toLowerCase()}"></div>
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
                if (!noteDiv) return;
                const noteId = noteDiv.getAttribute('data-note-id');
                const action = this.dataset.action;

                if (action === 'delete') {
                    // Mở modal xác nhận xóa
                    pendingDeleteNoteId = noteId;
                    document.getElementById('deleteConfirmModal').classList.remove('hidden');
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

    document.getElementById('confirmDeleteBtn').onclick = function () {
        if (!pendingDeleteNoteId) return;
        fetch('note.php', {
            method: 'POST',
            body: new URLSearchParams({
                action: 'move_to_trash',
                note_id: pendingDeleteNoteId
            })
        }).then(r => r.json()).then(data => {
            document.getElementById('deleteConfirmModal').classList.add('hidden');
            pendingDeleteNoteId = null;
            fetchNotes();
        });
    };
    document.getElementById('cancelDeleteBtn').onclick = function () {
        document.getElementById('deleteConfirmModal').classList.add('hidden');
        pendingDeleteNoteId = null;
    };



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

