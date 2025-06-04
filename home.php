<?php
session_set_cookie_params(0);
session_start();

if (isset($_SESSION['just_registered'])) {
    echo '
    <div class="alert alert-success alert-dismissible fade show" role="alert" style="position: fixed; top: 10px; right: 10px; z-index: 9999; min-width: 300px;">
      <strong>🎉 Congratulations!</strong> You have successfully registered. Please check your email to verify your account.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>';
    unset($_SESSION['just_registered']);
}

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

if (isset($_SESSION['just_registered'])) {
    echo "<script>alert('Welcome! You have successfully registered!');</script>";
    unset($_SESSION['just_registered']);
}

$is_active = $_SESSION['is_active'] ?? 0;
?>


<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SkyNote Website</title>
  <meta name="theme-color" content="#0d6efd">
  <link rel="icon" href="/.web_final/image/icon.png?v=1234" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" />
  <link rel="stylesheet" href="css/home.css" />
  <link rel="manifest" href="/.web_final/manifest.json">
  <script src="js/connect.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
    <div id="messageBox" style="display:none; position:fixed; top:20px; right:20px; background:#f44336; color:#fff; padding:10px 20px; border-radius:5px; box-shadow:0 2px 8px rgba(0,0,0,0.3); z-index:9999;">
        <span id="messageText"></span>
    </div>
    <?php if ($is_active == 0): ?>
    <div style="background: #ffcccc; color: #900; padding: 10px; text-align: center; font-weight: bold; border-bottom: 2px solid red;">
        Your account has not been activated yet. Please check your email to activate.
    </div>
    <?php endif; ?>

    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
        <i class="bi bi-x close-sidebar" title="Close" aria-label="Close sidebar" role="button"
            tabindex="0"></i><br><br>
        <ul>
            <li><i class="bi bi-sticky"></i> Note</li>
            <li><i class="bi bi-bell"></i> Reminder</li>
            <li><i class="bi bi-archive"></i> Storage</li>
            <li><i class="bi bi-trash"></i> Trash</li>
        </ul>
        <div class="labels">
            <h4><i class="bi bi-tag"></i> Labels</h4>
            <ul id="labelList"></ul>
            <ul>
                <li id="openLabelModalBtn" style="cursor:pointer;">
                    <i class="bi bi-plus-circle "></i> Edit Labels
                </li>
            </ul>
        </div>
    </div>

        <!-- Modal chỉnh sửa nhãn -->
        <div id="labelModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
            <span>Edit Labels</span>
            <i class="bi bi-x close-modal" title="Close"></i>
            </div>
            <div class="label-input">
            <i class="bi bi-plus-circle-fill"></i>
            <input type="text" id="newLabelInput" placeholder="Create new label..." />
            </div>
            <ul id="labellist">
            <!-- Danh sách nhãn hiển thị tại đây -->
            </ul>
        </div>
        </div>

    <!-- Main -->
    <div class="main" style="margin-left: 0; transition: margin-left 0.3s ease;">
        <div class="top-bar">
            <i class="bi bi-list" id="menuToggle" aria-label="Toggle menu" role="button" tabindex="0"></i>
            <h2><i class="bi bi-cloudy"></i> SkyNote</h2>
            <input type="text" placeholder="Search..." aria-label="Search notes" />
            <i class="bi bi-list" id="toggleViewBtn" title="List view"></i>
            <i class="bi bi-person-circle" title="User account"></i>
        </div>

        <div class="add-note-bar">
            <input type="text" class="add-note-input" placeholder="New note..." readonly
                onclick="expandAddNote()" />
            <div class="add-note-icons">
                <i class="bi bi-image" title="Add picture"></i>
                <i class="bi bi-palette" title="Note color"></i>
            </div>
        </div>

        <div class="add-note-expanded hidden">
            <input type="text" class="note-title-input" placeholder="Title">
            <textarea class="note-content-input" placeholder="Content..."></textarea>
            <div class="expanded-note-icons">
                <i class="bi bi-type" title="Font size"></i>
                <i class="bi bi-image" title="Add picture"></i>
                <i class="bi bi-palette" title="Note color"></i>
                <i class="bi bi-pin-angle" title="Pin"></i>
                <i class="bi bi-share" title="Share"></i>                
                <i class="bi bi-lock" title="Lock"></i>
                <i class="bi bi-tag" title="Label"></i>
                <button class="close-add-note" type="button" title="Close">Close</button>
            </div>
        </div>

        <div class="notes" aria-live="polite">
                <!-- Vị trí hiển thị danh sách note -->
        </div>
    </div>

    <!-- Sidebar người dùng -->
    <div class="user-dropdown-container">
        <div class="user-dropdown" id="userDropdown">
            <div class="user-header">
                <img src="image/background.jpg" alt="Avatar" class="user-avatar" />
                <div class="user-name">Username</div>
            </div>

            <ul class="user-menu">
                <li id="openPersonalInfo"><i class="bi bi-person-circle"></i> Personal Information
                </li>
                <li><i class="bi bi-gear"></i> Setting</li>
                <li></li>
                <li><i class="bi bi-box-arrow-right"></i> Logout</li>
            </ul>
        </div>

        <!-- Tab chứa thông tin cá nhân (ẩn ban đầu) -->
        <div class="personal-info-tab" id="personalInfoTab">
            <div class="personal-info-content">
                <i class="bi bi-x close-personal-info" title="Close" role="button" tabindex="0"></i>

                <img src="image/icontitle.jpg" alt="Avatar" class="avatar-info" />
                <h3>Tên người dùng</h3>
                <p>Email: user@example.com</p>

                <div class="personal-info-buttons">
                    <button>Reset Password</button>
                    <button>Edit information</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Giao diện chỉnh sửa note -->
        <div id="popup-modal" class="popup-modal hidden">
            <div class="add-note-expanded popup-content">
                <input type="text" id="modal-title" class="note-title-input" placeholder="Title">
                <textarea id="modal-content" class="note-content-input" placeholder="Content..."></textarea>
                <div class="expanded-note-icons">
                    <i class="bi bi-type" title="Font size"></i>
                    <i class="bi bi-image" title="Add picture"></i>
                    <i class="bi bi-palette" title="Note color"></i>
                    <i class="bi bi-pin-angle" title="Pin"></i>
                    <i class="bi bi-share" title="Share"></i>
                    <i class="bi bi-lock" title="Lock"></i>
                    <i class="bi bi-tag" title="Label" id="label-icon"></i>
                    <i class="bi bi-trash" title="Delete"></i>
                    <button class="close-add-note" id="popup-close">Close</button>
                </div>
            </div>
             <div id="label-popup" style="display:none; position:absolute;">
                <strong>Labels</strong>
                <ul id="label-list" style="list-style:none; padding-left:0; max-height:150px; overflow-y:auto;"></ul>
                <div style="display:flex; gap:6px; margin-top:50px;">
                    <input type="text" id="new-label-input" placeholder="Enter name label" />
                    <button id="add-label-btn" disabled>Add</button>
                </div>
            </div>
        </div>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menuToggle');
            const mainContent = document.querySelector('.main');
            const closeSidebar = document.querySelector('.close-sidebar');

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

            // Add new note
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
            

    </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/script.js"></script>
    <script src="js/labels.js"></script>   <!-- //Xử lý label trên sliddebars -->
    <script src="js/note_label.js"></script>   <!-- //Xử lý label trên notenote -->
    
</body>

</html>

