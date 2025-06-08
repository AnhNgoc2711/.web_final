document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const mainContent = document.querySelector('.main');
    const closeSidebar = document.querySelector('.close-sidebar');
    let pendingDeleteNoteId = null;




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
    const personalInfoModal = document.getElementById("personalInfoModal");
    const closePersonalInfoBtn = document.querySelector(".close-personal-info");

    // Mở Sidebar người dùng
    userIcon.addEventListener("click", () => {
        userDropdown.classList.toggle("active");
    });

    // Mở modal Personal In4
    openPersonalInfoBtn.addEventListener("click", () => {
        personalInfoModal.classList.remove("hidden");
        userDropdown.classList.remove("active");
    });

    // Đóng modal Personal In4
    closePersonalInfoBtn.addEventListener("click", () => {
        personalInfoModal.classList.add("hidden");
    });

    const editBtn = document.getElementById("editInfoBtn");
    const saveBtn = document.getElementById("saveEditBtn");
    const cancelBtn = document.getElementById("cancelEditBtn");
    const displayName = document.getElementById("displayName");
    const nameInput = document.getElementById("nameInput");
    const avatarPreview = document.getElementById("avatarPreview");
    const avatarInput = document.getElementById("avatarInput");
    const viewButtons = document.getElementById("viewButtons");
    const editActions = document.getElementById("editActions");
    let originalAvatarSrc = avatarPreview.src;

    avatarInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    editBtn.addEventListener("click", () => {
        originalAvatarSrc = avatarPreview.src; // lưu lại avatar cũ
        displayName.classList.add("hidden");
        nameInput.classList.remove("hidden");
        viewButtons.classList.add("hidden");
        editActions.classList.remove("hidden");
    });

    cancelBtn.addEventListener("click", () => {
        displayName.classList.remove("hidden");
        nameInput.classList.add("hidden");
        avatarPreview.src = originalAvatarSrc; // khôi phục avatar gốc nếu huỷ
        viewButtons.classList.remove("hidden");
        editActions.classList.add("hidden");
    });

    saveBtn.addEventListener("click", () => {
        displayName.textContent = nameInput.value;
        displayName.classList.remove("hidden");
        nameInput.classList.add("hidden");
        viewButtons.classList.remove("hidden");
        editActions.classList.add("hidden");
    });

    // Form Reset Password
    const resetBtn = document.getElementById("resetPasswordBtn");
    const resetForm = document.getElementById("resetPasswordForm");
    const cancelResetBtn = document.getElementById("cancelResetBtn");
    const saveResetBtn = document.getElementById("saveResetBtn");
    const emailDisplay = document.getElementById("emailDisplay");
    const avatarLabel = document.getElementById("avatarLabel");

    function resetViewToDefault() {
        resetForm.classList.add("hidden");
        displayName.classList.remove("hidden");
        emailDisplay.classList.remove("hidden");
        avatarLabel.classList.remove("hidden");
        avatarInput.classList.add("hidden");
        nameInput.classList.add("hidden");
        viewButtons.classList.remove("hidden");
    }

    resetBtn.addEventListener("click", () => {
        // Ẩn tất cả phần không cần
        viewButtons.classList.add("hidden");
        editActions.classList.add("hidden");
        nameInput.classList.add("hidden");
        displayName.classList.add("hidden");
        emailDisplay.classList.add("hidden");
        avatarInput.classList.add("hidden");
        avatarLabel.classList.add("hidden");
        // Hiện form đổi mật khẩu
        resetForm.classList.remove("hidden");
    });

    cancelResetBtn.addEventListener("click", resetViewToDefault);

    // Form Modal Setting
    const openSettingBtn = document.getElementById("openSettingBtn");
    const settingModal = document.getElementById("settingModal");
    const closeSettingBtn = document.querySelector(".close-setting");
    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    const fontSizeSelect = document.getElementById("fontSizeSelect");
    const themeRadios = document.querySelectorAll("input[name='theme']");

    // Mở modal Setting
    openSettingBtn.addEventListener("click", () => {
        settingModal.classList.remove("hidden");
        userDropdown.classList.remove("active");
        loadSettings();
    });

    // Đóng modal Setting
    closeSettingBtn.addEventListener("click", () => {
        settingModal.classList.add("hidden");
    });

    // Lưu và áp dụng setting
    saveSettingsBtn.addEventListener("click", () => {
        const selectedFontSize = fontSizeSelect.value;
        let selectedTheme = "light";
        themeRadios.forEach(radio => {
            if (radio.checked) selectedTheme = radio.value;
        });
        // Lưu vào localStorage
        localStorage.setItem("fontSize", selectedFontSize);
        localStorage.setItem("theme", selectedTheme);
        applySettings(selectedFontSize, selectedTheme);
        settingModal.classList.add("hidden");
    });

    // Hàm áp dụng setting lên trang
    function applySettings(fontSize, theme) {
        // Xóa hết các class font-size
        document.body.classList.remove("font-small", "font-medium", "font-large");
        document.body.classList.add(`font-${fontSize}`);
        // Áp theme
        if (theme === "dark") {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }

    // Hàm tải setting từ localStorage
    function loadSettings() {
        const savedFontSize = localStorage.getItem("fontSize") || "medium";
        const savedTheme = localStorage.getItem("theme") || "light";
        fontSizeSelect.value = savedFontSize;
        themeRadios.forEach(radio => {
            radio.checked = radio.value === savedTheme;
        });
        applySettings(savedFontSize, savedTheme);
    }

    // Áp dụng setting khi load trang
    document.addEventListener("DOMContentLoaded", () => {
        loadSettings();
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
    let saveTimer = null; // Định nghĩa biến saveTimer để dùng cho autosave

    // Hàm reset form note về trắng
    function resetAddNoteForm() {
        titleInput.value = '';
        contentInput.value = '';
        autosaveNoteId = null;
    }


    window.expandAddNote = function () {
        showCreateNoteModal();
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
    let openedNote = null

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

            // lấy label 
            const checkboxes = document.querySelectorAll('#label-selection input[type="checkbox"]:checked');
            const selectedLabels = Array.from(checkboxes).map(cb => cb.value);
            formData.append('labels', JSON.stringify(selectedLabels));

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
        const inner = popup.querySelector('.popup-content');

        let autosaveNoteId = null;

        // Thêm ảnh vào note
        function createImagePopup(targetIcon) {
            // Remove popup cũ nếu có
            const old = document.querySelector('.image-popup');
            if (old) old.remove();

            const popup = document.createElement('div');
            popup.className = 'image-popup';
            popup.style.position = 'absolute';
            popup.style.top = `${targetIcon.offsetTop + targetIcon.offsetHeight + 6}px`;
            popup.style.left = `${targetIcon.offsetLeft}px`;
            popup.style.padding = '8px';
            popup.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
            popup.style.background = '#fff';
            popup.style.zIndex = 1000;

            // Buttons
            const btn1 = document.createElement('button');
            btn1.textContent = 'Add 1 image';
            btn1.style.marginRight = '8px';
            const btn2 = document.createElement('button');
            btn2.textContent = 'Add multiple images';

            popup.append(btn1, btn2);

            // Container preview
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.style.marginTop = '8px';
            preview.style.display = 'flex';
            preview.style.flexWrap = 'wrap';
            preview.style.gap = '8px';
            popup.append(preview);

            // File input (hidden)
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            popup.append(fileInput);

            // Handle selection
            function selectFiles(multiple) {
                if (!autosaveNoteId) {
                    alert('Please save note first');
                    return;
                }
                fileInput.multiple = multiple;
                fileInput.click();
            }

            // Preview & upload
            fileInput.onchange = () => {
                const files = Array.from(fileInput.files);
                preview.innerHTML = ''; // clear trước
                const formData = new FormData();
                formData.append('action', 'upload_images');
                formData.append('note_id', autosaveNoteId);
                files.forEach(file => {
                    // preview local
                    const reader = new FileReader();
                    reader.onload = e => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.width = '80px';
                        img.style.height = '80px';
                        img.style.objectFit = 'cover';
                        preview.append(img);
                    };
                    reader.readAsDataURL(file);
                    // chuẩn bị upload
                    formData.append('images[]', file);
                });

                // upload
                fetch('note.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(r => r.json())
                    .then(res => {
                        if (!res.success) console.error(res.error || 'Upload failed');
                        // nếu server trả về đường dẫn, có thể update preview từ server
                    })
                    .catch(err => console.error('Error uploading images:', err));
            };

            // Bind button
            btn1.onclick = () => { selectFiles(false); };
            btn2.onclick = () => { selectFiles(true); };

            // Khi click ngoài popup thì đóng
            document.addEventListener('mousedown', function handler(evt) {
                if (!popup.contains(evt.target) && evt.target !== targetIcon) {
                    popup.remove();
                    document.removeEventListener('mousedown', handler);
                }
            });

            targetIcon.parentElement.append(popup);
        }



        // Reset mọi thứ mỗi lần mở
        titleInput.value = '';
        contentInput.value = '';
        contentInput.classList.remove('size-h1', 'size-h2', 'size-h3');
        if (inner) inner.style.backgroundColor = '#ffffff';
        newNoteIconState = { pinned: 0, locked: 0, is_shared: 0, has_label: 0 };

        // Hiển thị popup
        popup.classList.remove('hidden');

        // Nhảy con trỏ vào ô content
        setTimeout(() => contentInput.focus(), 50);

        // Hàm cập nhật icon và bind sự kiện click
        function updateIcons() {

            iconsDiv.innerHTML = generatePopupIconsHTML(newNoteIconState);

            // Size (Aa)
            const sizeWrapper = iconsDiv.querySelector('.size-type-wrapper');
            if (sizeWrapper) {
                const sizeIcon = sizeWrapper.querySelector('i[data-action="size"]');
                const sizePopup = sizeWrapper.querySelector('.size-type-popup');

                sizeIcon.onclick = e => {
                    e.stopPropagation();
                    sizePopup.classList.toggle('hidden');
                };

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

                sizePopup.querySelectorAll('.size-option').forEach(opt => {
                    opt.onclick = () => {
                        if (!autosaveNoteId) return;
                        const size = opt.dataset.size;

                        fetch('note_test.php', {
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
                            });
                    };
                });
            }

            // Color
            const paletteIcon = iconsDiv.querySelector('i[data-action="palette"]');
            if (paletteIcon) {
                paletteIcon.onclick = function (e) {
                    e.stopPropagation();
                    if (!autosaveNoteId) return alert("Note chưa lưu!");
                    createColorPopup(paletteIcon, autosaveNoteId);
                };
            }

            // Tag
            iconsDiv.querySelectorAll('i[data-action]').forEach(icon => {
                const action = icon.dataset.action;
                if (['palette', 'size', 'image'].includes(action)) return;


                icon.onclick = e => {
                    e.stopPropagation();
                    if (action === 'pin') newNoteIconState.pinned ^= 1;
                    else if (action === 'lock') newNoteIconState.locked ^= 1;
                    else if (action === 'share') newNoteIconState.is_shared ^= 1;
                    else if (action === 'tag') newNoteIconState.has_label ^= 1;

                    updateIcons(); // Giao diện phản hồi ngay
                };
            });


            // Image
            const imgIcon = iconsDiv.querySelector('i[data-action="image"]');
            if (imgIcon) {
                imgIcon.onclick = e => {
                    e.stopPropagation();
                    createImagePopup(imgIcon);
                };
            }

        }

        // Gọi lần đầu để render icons
        updateIcons();

        // Autosave khi nhập
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

                //Thêm icon state
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
                        fetchNotes(); // Update giao diện
                    });
            }, 400);
        }

        titleInput.oninput = autosaveCreateNote;
        contentInput.oninput = autosaveCreateNote;

        // Đóng popup
        popup.onclick = function (e) {
            if (e.target === popup) hideCreateModal();
        };

        document.getElementById('popup-close').onclick = hideCreateModal;

        function hideCreateModal() {
            popup.classList.add('hidden');
            autosaveNoteId = null;
            newNoteIconState = { pinned: 0, locked: 0, is_shared: 0, has_label: 0 };
        }

    }



    function showNoteModal(note) {
        window.currentNoteId = note.note_id;
        const popup = document.getElementById('popup-modal');
        popup.setAttribute('data-note-id', note.note_id);
        const titleInput = document.getElementById('modal-title');
        const contentInput = document.getElementById('modal-content');
        const iconsDiv = popup.querySelector('.icons');

        const inner = popup.querySelector('.popup-content');
        if (inner) inner.style.backgroundColor = note.color || '#ffffff';

        popup.classList.remove('hidden');
        titleInput.value = note.title || '';
        contentInput.value = note.content || '';
        titleInput.focus();

        // Gán ID note cho autosave
        function createImagePopup(targetIcon) {
            // Remove popup cũ nếu có
            const old = document.querySelector('.image-popup');
            if (old) old.remove();

            const popup = document.createElement('div');
            popup.className = 'image-popup';
            popup.style.position = 'absolute';
            popup.style.top = `${targetIcon.offsetTop + targetIcon.offsetHeight + 6}px`;
            popup.style.left = `${targetIcon.offsetLeft}px`;
            popup.style.padding = '8px';
            popup.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
            popup.style.background = '#fff';
            popup.style.zIndex = 1000;

            // Buttons
            const btn1 = document.createElement('button');
            btn1.textContent = 'Add 1 image';
            btn1.style.marginRight = '8px';
            const btn2 = document.createElement('button');
            btn2.textContent = 'Add multiple images';

            popup.append(btn1, btn2);

            // Container preview
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.style.marginTop = '8px';
            preview.style.display = 'flex';
            preview.style.flexWrap = 'wrap';
            preview.style.gap = '8px';
            popup.append(preview);

            // File input (hidden)
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            popup.append(fileInput);

            // Handle selection
            function selectFiles(multiple) {
                if (!autosaveNoteId) {
                    alert('Please save note first');
                    return;
                }
                fileInput.multiple = multiple;
                fileInput.click();
            }

            // Preview & upload
            fileInput.onchange = () => {
                const files = Array.from(fileInput.files);
                preview.innerHTML = ''; // clear trước
                const formData = new FormData();
                formData.append('action', 'upload_images');
                formData.append('note_id', autosaveNoteId);
                files.forEach(file => {
                    // preview local
                    const reader = new FileReader();
                    reader.onload = e => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.width = '80px';
                        img.style.height = '80px';
                        img.style.objectFit = 'cover';
                        preview.append(img);
                    };
                    reader.readAsDataURL(file);
                    // chuẩn bị upload
                    formData.append('images[]', file);
                });

                // upload
                fetch('note.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(r => r.json())
                    .then(res => {
                        if (!res.success) console.error(res.error || 'Upload failed');
                        // nếu server trả về đường dẫn, có thể update preview từ server
                    })
                    .catch(err => console.error('Error uploading images:', err));
            };

            // Bind button
            btn1.onclick = () => { selectFiles(false); };
            btn2.onclick = () => { selectFiles(true); };

            // Khi click ngoài popup thì đóng
            document.addEventListener('mousedown', function handler(evt) {
                if (!popup.contains(evt.target) && evt.target !== targetIcon) {
                    popup.remove();
                    document.removeEventListener('mousedown', handler);
                }
            });

            targetIcon.parentElement.append(popup);
        }



        let iconState = {
            pinned: note.pinned || 0,
            locked: note.locked || 0,
            is_shared: note.is_shared || 0,
            has_label: note.has_label || 0,
            size_type: note.size_type || 'H2'
        };



        // Khi mở modal, gán class size cho textarea
        contentInput.classList.remove('size-h1', 'size-h2', 'size-h3');
        contentInput.classList.add('size-' + iconState.size_type.toLowerCase());

        function updateIcons() {

            iconsDiv.innerHTML = generatePopupIconsHTML(iconState);

            // Color palette icon
            let paletteIcon = iconsDiv.querySelector('i[data-action="palette"]');
            if (paletteIcon) {
                paletteIcon.onclick = function (e) {
                    e.stopPropagation();
                    createColorPopup(paletteIcon, note.note_id);
                };
            }

            // Tag icon
            const tagIcon = iconsDiv.querySelector('i[data-action="tag"]');
            tagIcon.addEventListener('click', async e => {
                e.stopPropagation();
                const popup = document.getElementById('label-popup');

                // Đóng nếu đang mở
                if (popup.style.display === 'block') {
                    popup.style.display = 'none';
                    return;
                }

                // Kiểm tra note đã chọn chưa
                if (!window.currentNoteId) {
                    return alert('You have not selected any notes to label.');
                }

                //Load nhãn của note -> render lên popup
                await window.loadLabelsForNote(window.currentNoteId);
                window.renderLabels();
                window.updateSelectedLabelsDisplay();

                popup.style.display = 'block';
            });


            // Size type icon
            const sizeTypeWrapper = iconsDiv.querySelector('.size-type-wrapper');
            if (sizeTypeWrapper) {
                const sizeIcon = sizeTypeWrapper.querySelector('i[data-action="size"]');
                const sizePopup = sizeTypeWrapper.querySelector('.size-type-popup');

                if (sizeIcon && sizePopup) {
                    // Khi click vào icon size -> hiện/ẩn popup
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

                            contentInput.classList.remove('size-h1', 'size-h2', 'size-h3');
                            contentInput.classList.add('size-' + newSize.toLowerCase());

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
                                    // Cập nhật lại iconState, render lại icon, update notes
                                    iconState.size_type = newSize;
                                    updateIcons();
                                    fetchNotes();
                                })
                                .catch(err => {
                                    showMessage('Error set_size_type: ' + err);
                                });
                        };
                    });
                }
            }


            // Image icon
            const imgIcon = iconsDiv.querySelector('i[data-action="image"]');
            if (imgIcon) {
                imgIcon.onclick = e => {
                    e.stopPropagation();
                    createImagePopup(imgIcon);
                };
            }


            // Assign events to pin/lock/share/tag icons (except size icon)
            iconsDiv.querySelectorAll('i[data-action]').forEach(icon => {
                const action = icon.dataset.action;
                if (['palette', 'size', 'image'].includes(action)) return;

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
                            if (action === 'pin') iconState.pinned ^= 1;
                            else if (action === 'lock') iconState.locked ^= 1;
                            else if (action === 'share') iconState.is_shared ^= 1;
                            else if (action === 'tag') iconState.has_label ^= 1;
                            updateIcons();
                            fetchNotes();
                        })
                        .catch(err => {
                            showMessage('Lỗi khi toggle_icon: ' + err);
                        });
                };

            });

            // Palette icon
            paletteIcon = iconsDiv.querySelector('i[data-action="palette"]');
            if (paletteIcon) {
                paletteIcon.onclick = function (e) {
                    e.stopPropagation();
                    createColorPopup(paletteIcon, note.note_id);
                };
            }

        }

        updateIcons();

        // AUTOSAVE 
        let saveTimer = null;
        function autosaveModal() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                if (!navigator.onLine) {
                    showMessage("Connection lost, please check your network and try again.");
                    return;
                }
                // Chỉ update title, content, size_type 
                const params = new URLSearchParams({
                    note_id: note.note_id,
                    title: titleInput.value,
                    content: contentInput.value,
                    size_type: iconState.value
                });
                fetch('note.php', {
                    method: 'POST',
                    body: params
                })
                    .then(r => r.json())
                    .then(data => {
                        const card = document.querySelector(`.note[data-note-id="${note.note_id}"]`);
                        if (card) {
                            // giữ nguyên màu cũ, chỉ update text
                            card.querySelector('.title').textContent = titleInput.value;
                            card.querySelector('.body').textContent = contentInput.value;
                        }
                        if (typeof saveLabelsForNote === 'function') {
                            saveLabelsForNote(note.note_id);
                        }
                    })
                    .catch(err => showMessage('Lỗi autosave: ' + err));
            }, 400);
        }

        // đảm bảo bạn vẫn gắn event:
        titleInput.addEventListener('input', autosaveModal);
        contentInput.addEventListener('input', autosaveModal);



        // Cuối cùng nhớ gọi autosaveModal() mỗi khi người dùng thay đổi title/content, ví dụ:
        titleInput.addEventListener('input', autosaveModal);
        contentInput.addEventListener('input', autosaveModal);
        inner.addEventListener('input', autosaveModal);

        // Đóng popup X
        const popupCloseBtn = document.getElementById('popup-close');
        if (popupCloseBtn) {
            popupCloseBtn.onclick = hideEditModal;
        }

        // Đóng popup khi click ra ngoài vùng trắng
        popup.onclick = function (e) {
            if (e.target === popup) hideEditModal();
        };

        function hideEditModal() {
            popup.classList.add('hidden');
            fetchNotes();
        }
    }




    function renderNotes(notes) {
        const container = document.querySelector('.notes');
        if (!container) return;
        const pinnedNotes = notes.filter(n => String(n.pinned) === '1');
        const normalNotes = notes.filter(n => String(n.pinned) === '0');

        let html = "";

        // Pinned
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

        // Not Pinned
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
        let labelHtml = '';
        if (note.labels && Array.isArray(note.labels) && note.labels.length > 0) {
            labelHtml += `<div class="note-labels" style="margin-top: 8px;">`;
            note.labels.forEach(label => {

                const labelName = typeof label === 'object' && label.name_label ? label.name_label : label;
                labelHtml += `
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
            labelHtml += `</div>`;
        }

        // ghép labelHtml vào đúng chỗ dưới content
        if (note.title && note.title.trim() !== "") {
            return `
            <div class="note" data-note-id="${note.note_id}" style="background-color: ${note.color || '#ffffff'}">

                <div class="icons">
                    ${generateCardIconsHTML(note)}
                </div>
                <div class="content">
                    <div class="title">${note.title}</div>
                    <div class="body size-${(note.size_type || 'H2').toLowerCase()}">${note.content || ''}</div>
                    ${labelHtml}
                </div>
            </div>
        `;
        } else {
            return `
            <div class="note" data-note-id="${note.note_id}" style="background-color: ${note.color || '#ffffff'}">

                <div class="icons">
                    ${generateCardIconsHTML(note)}
                </div>
                <div class="content">
                    <div class="title">${note.content || ''}</div>
                    <div class="body size-${(note.size_type || 'H2').toLowerCase()}"></div>
                    ${labelHtml}
                </div>
            </div>
        `;
        }
    }
    window.generateNoteHTML = generateNoteHTML;



    function saveLabelsForNote(note_id) {
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


    function attachIconEvents() {
        document.querySelectorAll('.notes .icons i').forEach(icon => {
            icon.onclick = function (e) {
                e.stopPropagation();
                const noteDiv = this.closest('.note');
                if (!noteDiv) return;
                const noteId = noteDiv.getAttribute('data-note-id');
                const action = this.dataset.action;

                if (action === 'delete') {
                    pendingDeleteNoteId = noteId;

                    const modal = document.getElementById('deleteConfirmModal');
                    modal.classList.add('show'); // Hiện lên

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
    window.attachIconEvents = attachIconEvents;


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
    window.attachNoteClickEvents = attachNoteClickEvents;


    document.getElementById('confirmDeleteBtn').onclick = function () {
        if (!pendingDeleteNoteId) return;

        fetch('note.php', {
            method: 'POST',
            body: new URLSearchParams({
                action: 'move_to_trash',
                note_id: pendingDeleteNoteId
            })
        }).then(r => r.json()).then(data => {
            document.getElementById('deleteConfirmModal').classList.remove('show');
            pendingDeleteNoteId = null;
            fetchNotes();
        });
    };
    document.getElementById('cancelDeleteBtn').onclick = function () {
        document.getElementById('deleteConfirmModal').classList.remove('show');
    };

    // Change Password
    document.getElementById("saveResetBtn").addEventListener("click", async () => {
        const oldPassword = document.getElementById("oldPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmNewPassword = document.getElementById("confirmNewPassword").value;

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            showMessage("Please fill in all the password fields.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            showMessage("New passwords do not match.");
            return;
        }

        try {
            const response = await fetch("change_password.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                // credentials: "include",
                body: JSON.stringify({
                    action: "reset", // Gửi action nếu PHP yêu cầu
                    oldPassword,
                    newPassword,
                    confirmNewPassword
                })
            });

            const result = await response.json();

            // Hiển thị thông báo thành công hoặc lỗi
            if (result.success) {
                showMessage(result.message || "Password changed successfully."); document.getElementById("oldPassword").value = "";
                document.getElementById("newPassword").value = "";
                document.getElementById("confirmNewPassword").value = "";
            } else {
                showMessage(result.error || result.message || "Failed to change password.");
            }

        } catch (err) {
            console.error("Fetch error:", err);
            showMessage("Unexpected error occurred. Please try again.");
        }
    });


    // Change note color
    function createColorPopup(targetIcon, note_id) {
        // Xoá popup cũ nếu đang mở
        const existing = document.querySelector('.color-popup');
        if (existing) existing.remove();

        const colors = ['#ffffff', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb', '#aecbfa'];
        const colorPopup = document.createElement('div');
        colorPopup.className = 'color-popup';

        // Gán CSS để hiện dưới icon 
        colorPopup.style.position = 'absolute';
        colorPopup.style.top = `${targetIcon.offsetTop + targetIcon.offsetHeight + 6}px`;
        colorPopup.style.left = `${targetIcon.offsetLeft}px`;

        colors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'color-option';
            colorDiv.style.backgroundColor = color;
            colorDiv.dataset.color = color;

            colorDiv.onclick = function (e) {
                e.stopPropagation();
                fetch('note.php', {
                    method: 'POST',
                    body: new URLSearchParams({
                        action: 'set_color',
                        note_id: note_id,
                        color: color
                    })
                })
                    .then(r => r.json())
                    .then(() => {
                        // Gán lại màu cho modal đang mở
                        const popup = document.getElementById('popup-modal');
                        const inner = popup.querySelector('.popup-content');
                        if (inner) inner.style.backgroundColor = color;

                        colorPopup.remove();
                        fetchNotes();
                    });
            };


            colorPopup.appendChild(colorDiv);
        });

        // Gắn popup vào đúng chỗ
        targetIcon.parentElement.appendChild(colorPopup);
    }



    // Lấy danh sách note từ API
    async function fetchNotes() {
        fetch('note.php')
            .then(r => r.json())
            .then(renderNotes);
    }

    window.fetchNotes = fetchNotes;
    window.renderNotes = renderNotes;

    //load trang
    fetchNotes();

    //Logout 
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            window.location.href = 'home.php?logout=1';
        });
    }
});


