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


    // REnder icon ngoài card
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
        iconsDiv.innerHTML = generatePopupIconsHTML(newNoteIconState);

        // Sự kiện click icon
        iconsDiv.querySelectorAll('i').forEach(icon => {
            icon.onclick = function (e) {
                e.stopPropagation();
                const action = this.dataset.action;
                if (action === 'pin') newNoteIconState.pinned ^= 1;
                if (action === 'lock') newNoteIconState.locked ^= 1;
                if (action === 'share') newNoteIconState.is_shared ^= 1;
                if (action === 'tag') newNoteIconState.has_label ^= 1;
                // ...nếu có các icon khác thì bổ sung
                showCreateNoteModal(); // Re-render để cập nhật màu icon
            };
        });

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

        // Render icon popup theo trạng thái thực tế của note
        iconsDiv.innerHTML = generatePopupIconsHTML(note);

        // Sự kiện click icon
        iconsDiv.querySelectorAll('i').forEach(icon => {
            icon.onclick = function (e) {
                e.stopPropagation();
                const action = this.dataset.action;
                if (action === 'delete') {
                    if (confirm("Xóa note này?")) {
                        // Xử lý xóa nếu muốn
                    }
                    return;
                }
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
                        fetch('note.php')
                            .then(r => r.json())
                            .then(notes => {
                                const updated = notes.find(n => n.note_id == note.note_id);
                                if (updated) showNoteModal(updated);
                            });
                        fetchNotes();
                    });
            };
        });

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

        // Hiện popup, cập nhật input
        popup.classList.remove('hidden');
        titleInput.value = note.title || '';
        contentInput.value = note.content || '';
        titleInput.focus();
    }







    // function showNoteModal(note) {
    //     const popup = document.getElementById('popup-modal');
    //     const titleInput = document.getElementById('modal-title');
    //     const contentInput = document.getElementById('modal-content');
    //     const iconsDiv = popup.querySelector('.icons');

    //     // Render icon popup theo trạng thái thực tế của note
    //     iconsDiv.innerHTML = generatePopupIconsHTML(note);

    //     // Sự kiện click icon
    //     iconsDiv.querySelectorAll('i').forEach(icon => {
    //         icon.onclick = function (e) {
    //             e.stopPropagation();
    //             const action = this.dataset.action;
    //             if (action === 'delete') {
    //                 if (confirm("Xóa note này?")) {
    //                     // Xử lý xóa nếu muốn
    //                 }
    //                 return;
    //             }
    //             fetch('note.php', {
    //                 method: 'POST',
    //                 body: new URLSearchParams({
    //                     action: 'toggle_icon',
    //                     note_id: note.note_id,
    //                     icon: action
    //                 })
    //             })
    //                 .then(r => r.json())
    //                 .then(() => {
    //                     fetch('note.php')
    //                         .then(r => r.json())
    //                         .then(notes => {
    //                             const updated = notes.find(n => n.note_id == note.note_id);
    //                             if (updated) showNoteModal(updated);
    //                         });
    //                     fetchNotes();
    //                 });
    //         };
    //     });

    //     // Autosave nội dung note
    //     let saveTimer = null;
    //     function autosaveModal() {
    //         clearTimeout(saveTimer);
    //         saveTimer = setTimeout(() => {
    //             fetch('note.php', {
    //                 method: 'POST',
    //                 body: new URLSearchParams({
    //                     note_id: note.note_id,
    //                     title: titleInput.value,
    //                     content: contentInput.value
    //                 })
    //             }).then(r => r.json())
    //                 .then(data => fetchNotes());
    //         }, 400);
    //     }
    //     titleInput.oninput = autosaveModal;
    //     contentInput.oninput = autosaveModal;

    //     // Đóng popup
    //     document.getElementById('popup-close').onclick = hideEditModal;
    //     popup.onclick = function (e) {
    //         if (e.target === popup) hideEditModal();
    //     };
    //     function hideEditModal() {
    //         popup.classList.add('hidden');
    //     }

    //     // Hiện popup, cập nhật input
    //     popup.classList.remove('hidden');
    //     titleInput.value = note.title || '';
    //     contentInput.value = note.content || '';
    //     titleInput.focus();
    // }
















    function renderNotes(notes) {
        const container = document.querySelector('.notes');
        container.innerHTML = '';
        notes.forEach(note => {
            let showIcons = (note.pinned == 1 || note.locked == 1 || note.is_shared == 1 || note.has_label == 1);
            let showIconsClass = showIcons ? " show-icons" : "";
            let noteHtml = `
            <div class="note${showIconsClass}" data-note-id="${note.note_id}">
                <div class="icons">
                    ${generateCardIconsHTML(note)}
                </div>
                <div class="content">
                    ${note.title && note.title.trim() !== ""
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
        attachIconEvents();
        attachNoteClickEvents();
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

    // let newNoteIconState = {
    //     pinned: 0,
    //     locked: 0,
    //     is_shared: 0,
    //     has_label: 0
    // };

    // function showCreateNoteModal() {
    //     const popup = document.getElementById('popup-modal');
    //     const titleInput = document.getElementById('modal-title');
    //     const contentInput = document.getElementById('modal-content');

    //     popup.classList.remove('hidden');
    //     titleInput.value = '';
    //     contentInput.value = '';
    //     titleInput.focus();

    //     // Render icon với trạng thái từ biến tạm
    //     const iconsHTML = `
    //     <i class="bi ${newNoteIconState.pinned == 1 ? "bi-pin-angle-fill active" : "bi-pin-angle"}" data-action="pin"></i>
    //     <i class="bi ${newNoteIconState.locked == 1 ? "bi-lock-fill active" : "bi-lock"}" data-action="lock"></i>
    //     <i class="bi ${newNoteIconState.is_shared == 1 ? "bi-share-fill active" : "bi-share"}" data-action="share"></i>
    //     <i class="bi ${newNoteIconState.has_label == 1 ? "bi-tag-fill active" : "bi-tag"}" data-action="tag"></i>
    // `;
    //     popup.querySelector('.icons').innerHTML = iconsHTML;

    //     // Xử lý click icon (toggle trạng thái tạm)
    //     popup.querySelectorAll('.icons i').forEach(icon => {
    //         icon.onclick = function (e) {
    //             e.stopPropagation();
    //             const action = this.dataset.action;
    //             if (action === 'pin') newNoteIconState.pinned ^= 1;
    //             else if (action === 'lock') newNoteIconState.locked ^= 1;
    //             else if (action === 'share') newNoteIconState.is_shared ^= 1;
    //             else if (action === 'tag') newNoteIconState.has_label ^= 1;
    //             showCreateNoteModal(); // Render lại để cập nhật icon
    //         }
    //     });

    //     // Autosave khi nhập
    //     let saveTimer = null;
    //     function autosaveCreateNote() {
    //         clearTimeout(saveTimer);
    //         saveTimer = setTimeout(() => {
    //             const title = titleInput.value.trim();
    //             const content = contentInput.value.trim();
    //             if (!title && !content) return;
    //             const formData = new FormData();
    //             formData.append('title', title);
    //             formData.append('content', content);
    //             formData.append('pinned', newNoteIconState.pinned);
    //             formData.append('locked', newNoteIconState.locked);
    //             formData.append('is_shared', newNoteIconState.is_shared);
    //             // Gửi has_label nếu xử lý label luôn, hoặc gọi riêng

    //             if (autosaveNoteId) formData.append('note_id', autosaveNoteId);

    //             fetch('note.php', {
    //                 method: 'POST',
    //                 body: formData
    //             })
    //                 .then(r => r.json())
    //                 .then(data => {
    //                     if (data.note_id) autosaveNoteId = data.note_id;
    //                     fetchNotes();
    //                 });
    //         }, 400);
    //     }
    //     titleInput.oninput = autosaveCreateNote;
    //     contentInput.oninput = autosaveCreateNote;

    //     // Đóng popup
    //     document.getElementById('popup-close').onclick = hideCreateModal;
    //     popup.onclick = function (e) {
    //         if (e.target === popup) {
    //             hideCreateModal();
    //         }
    //     };
    //     function hideCreateModal() {
    //         popup.classList.add('hidden');
    //         autosaveNoteId = null;
    //         // Reset trạng thái icon về mặc định khi đóng
    //         newNoteIconState = { pinned: 0, locked: 0, is_shared: 0, has_label: 0 };
    //     }
    // }



    // function showNoteModal(note) {
    //     const popup = document.getElementById('popup-modal');
    //     popup.classList.remove('hidden');
    //     const titleInput = document.getElementById('modal-title');
    //     const contentInput = document.getElementById('modal-content');
    //     titleInput.value = note.title || '';
    //     contentInput.value = note.content || '';
    //     titleInput.focus();

    //     const iconsDiv = popup.querySelector('.icons');
    //     iconsDiv.innerHTML = generatePopupIconsHTML(note);

    //     // Gắn lại sự kiện cho icon popup
    //     iconsDiv.querySelectorAll('i').forEach(icon => {
    //         icon.onclick = function (e) {
    //             e.stopPropagation();
    //             const action = this.dataset.action;
    //             if (action === 'delete') {
    //                 if (confirm("Xóa note này?")) {
    //                     // TODO: API xóa note nếu cần
    //                 }
    //                 return;
    //             }
    //             fetch('note.php', {
    //                 method: 'POST',
    //                 body: new URLSearchParams({
    //                     action: 'toggle_icon',
    //                     note_id: note.note_id,
    //                     icon: action
    //                 })
    //             })
    //                 .then(r => r.json())
    //                 .then(() => {
    //                     fetch('note.php')
    //                         .then(r => r.json())
    //                         .then(notes => {
    //                             const updated = notes.find(n => n.note_id == note.note_id);
    //                             if (updated) showNoteModal(updated);
    //                         });
    //                     fetchNotes();
    //                 });
    //         }
    //     });

    //     // Autosave nội dung note
    //     let saveTimer = null;
    //     function autosaveModal() {
    //         clearTimeout(saveTimer);
    //         saveTimer = setTimeout(() => {
    //             fetch('note.php', {
    //                 method: 'POST',
    //                 body: new URLSearchParams({
    //                     note_id: note.note_id,
    //                     title: titleInput.value,
    //                     content: contentInput.value
    //                 })
    //             }).then(r => r.json())
    //                 .then(data => fetchNotes());
    //         }, 400);
    //     }
    //     titleInput.oninput = autosaveModal;
    //     contentInput.oninput = autosaveModal;

    //     // GẮN LẠI SỰ KIỆN ĐÓNG POPUP
    //     document.getElementById('popup-close').onclick = () => {
    //         popup.classList.add('hidden');
    //     };
    //     popup.onclick = function (e) {
    //         if (e.target === popup) popup.classList.add('hidden');
    //     };
    // }


    // function generateCardIconsHTML(note) {
    //     return `
    //     <i class="bi bi-trash" data-action="delete"></i>
    //     <i class="bi ${note.has_label == 1 ? "bi-tag-fill active" : "bi-tag"}" data-action="tag"></i>
    //     <i class="bi ${note.locked == 1 ? "bi-lock-fill active" : "bi-lock"}" data-action="lock"></i>
    //     <i class="bi ${note.is_shared == 1 ? "bi-share-fill active" : "bi-share"}" data-action="share"></i>
    //     <i class="bi ${note.pinned == 1 ? "bi-pin-angle-fill active" : "bi-pin-angle"}" data-action="pin"></i>
    // `;
    // }

    // function generatePopupIconsHTML(state) {
    //     // state = note (edit) hoặc newNoteIconState (tạo mới)
    //     return `
    //     <i class="bi bi-type${state.size_type == 1 ? " active" : ""}" data-action="font"></i>
    //     <i class="bi bi-image${state.has_image == 1 ? " active" : ""}" data-action="image"></i>
    //     <i class="bi bi-palette${state.has_color == 1 ? " active" : ""}" data-action="palette"></i>
    //     <i class="bi ${state.pinned == 1 ? "bi-pin-angle-fill active" : "bi-pin-angle"}" data-action="pin"></i>
    //     <i class="bi ${state.is_shared == 1 ? "bi-share-fill active" : "bi-share"}" data-action="share"></i>
    //     <i class="bi ${state.locked == 1 ? "bi-lock-fill active" : "bi-lock"}" data-action="lock"></i>
    //     <i class="bi ${state.has_label == 1 ? "bi-tag-fill active" : "bi-tag"}" data-action="tag"></i>
    // `;
    // }





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

// //logout
// document.addEventListener('DOMContentLoaded', function () {

// });
