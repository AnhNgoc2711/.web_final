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

    // logout
    const logoutBtn = document.querySelector(".bi-box-arrow-right").parentElement;
    logoutBtn.addEventListener("click", () => {
        alert("Bạn đã đăng xuất!");
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
        if (!addNoteExpanded.classList.contains('hidden') && !addNoteExpanded.contains(e.target) && e.target !== addNoteInput) {
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

    // Global biến tạm để giữ note đang mở popup
    let openedNote = null;

    // Hiển thị danh sách note
    function renderNotes(notes) {
        const container = document.querySelector('.notes');
        if (!container) return;
        container.innerHTML = '';
        notes.forEach(note => {
        let noteHtml = `
            <div class="note" tabindex="0" aria-label="${note.title || note.content || 'note'}" data-note-id="${note.note_id}">
                <div class="icons">
                    <i class="bi bi-pin-angle" title="Pin"></i>
                    <i class="bi bi-share" title="Share"></i>
                    <i class="bi bi-lock" title="Lock"></i>
                    <i class="bi bi-tag" title="Label"></i>
                    <i class="bi bi-trash" title="Delete"></i>
                </div>
            <div class="content">
            `;
            if (note.title && note.title.trim() !== "") {
                noteHtml += `<p class="title">${note.title}</p>`;
                noteHtml += `<p class="body">${note.content || ''}</p>`;
            } else {
                // Nếu không có title: content sẽ nằm ở vị trí title, body rỗng để giữ chiều cao
                noteHtml += `<p class="title">${note.content || ''}</p>`;
                noteHtml += `<p class="body"></p>`;
            }
            noteHtml += `
                    </div>
                    </div>
                `;
            container.innerHTML += noteHtml;
        });
    }

    // Gắn event cho tất cả note
    document.querySelectorAll('.note').forEach(el => {
        el.addEventListener('click', function () {
            const noteId = el.getAttribute('data-note-id');
            const note = notes.find(n => n.note_id == noteId);
            if (!note) return;
            openedNote = note;
            showNoteModal(note);
        });
    });
    

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
