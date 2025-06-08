<?php
session_set_cookie_params(0);
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header("Location: login.php");
    exit;
}


if (isset($_SESSION['just_registered'])) {
    echo '
    <div class="alert alert-success alert-dismissible fade show" role="alert" style="position: fixed; top: 10px; right: 10px; z-index: 9999; min-width: 300px;">
        <strong>🎉 Congratulations!</strong> You have successfully registered. Please check your email to verify your account.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>';
    unset($_SESSION['just_registered']);
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
    <link rel="icon" href="/image/nen.jpg?v=1234" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" />
    <link rel="stylesheet" href="css/home.css" />
    <link rel="manifest" href="manifest.json">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/connect.js"> </script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>

<body>
    <div id="messageBox"
        style="display:none; position:fixed; top:20px; right:20px; background:#f44336; color:#fff; padding:10px 20px; border-radius:5px; box-shadow:0 2px 8px rgba(0,0,0,0.3); z-index:9999;">
        <span id="messageText"></span>
    </div>
    <?php if ($is_active == 0): ?>
        <div
            style="background: #ffcccc; color: #900; padding: 10px; text-align: center; font-weight: bold; border-bottom: 2px solid red;">
            Your account has not been activated yet. Please check your email to activate.
        </div>
    <?php endif; ?>
    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
        <i class="bi bi-x close-sidebar" title="Close" aria-label="Close sidebar" role="button"
            tabindex="0"></i><br><br>
        <ul>
            <li><i class="bi bi-sticky"></i> <a href="home.php" style="color: inherit; text-decoration: none;"></i>
                    Note</li>
            <li><i class="bi bi-bell"></i> Reminder</li>
            <li><i class="bi bi-trash"></i> <a href="trash.php" style="color: inherit; text-decoration: none;">Trash</a>
            <li><i class="bi bi-tag"></i> Labels</li>

        </ul>
        <div class="labels">

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
            <i class="bi-list" id="menuToggle" aria-label="Toggle menu" role="button" tabindex="0"></i>
            <h2><i class="bi bi-cloudy"></i> SkyNote</h2>
            <input type="text" placeholder="Search..." aria-label="Search notes" />
            <i class="bi bi-list-task" id="toggleViewBtn" title="List view"></i>
            <i class="bi bi-person-circle" title="User account"></i>
        </div>


        <!-- Vị trí hiển thị danh sách note -->
        <div class="notes" aria-live="polite">
            <!-- JS sẽ render nhóm note ở đây -->
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
                <li id="openSettingBtn"><i class="bi bi-gear"></i> Setting</li>
                <li></li>
                <li id="logoutBtn"><i class="bi bi-box-arrow-right"></i> Logout</li>
            </ul>
        </div>

        <!-- Modal thông tin cá nhân -->
        <div class="personal-info-modal hidden" id="personalInfoModal">
            <div class="modal-overlay">
                <div class="modal-personal">
                    <i class="bi bi-x close-personal-info" title="Close" role="button" tabindex="0"></i>
                    <!-- Avatar hiện thị -->
                    <img id="avatarPreview" src="image/icontitle.jpg" alt="Avatar" class="avatar-edit-preview" />
                    <label for="avatarInput" id="avatarLabel" class="avatar-upload-btn">Chọn ảnh mới</label>
                    <input type="file" id="avatarInput" accept="image/*" class="hidden" />
                    <!-- Hiển thị tên -->
                    <h3 id="displayName">Username</h3>
                    <input type="text" class="hidden" id="nameInput" value="Tên người dùng" />
                    <!-- Email -->
                    <p id="emailDisplay">Email: <span id="userEmail">user@example.com</span></p>
                    <div class="personal-info-buttons" id="viewButtons">
                        <button class="btn-outline-pink" id="resetPasswordBtn">Reset Password</button>
                        <button class="btn-filled-pink" id="editInfoBtn">Edit Information</button>
                    </div>
                    <div class="personal-info-buttons hidden" id="editActions">
                        <button class="btn-outline-pink" id="cancelEditBtn">Cancel</button>
                        <button class="btn-filled-pink" id="saveEditBtn">Save</button>
                    </div>
                    <!-- Form đổi mật khẩu (ẩn mặc định) -->
                    <div class="reset-password-form hidden" id="resetPasswordForm">
                        <input type="password" id="oldPassword" placeholder="Nhập mật khẩu cũ" />
                        <input type="password" id="newPassword" placeholder="Nhập mật khẩu mới" />
                        <input type="password" id="confirmNewPassword" placeholder="Nhập lại mật khẩu mới" />
                        <div class="personal-info-buttons">
                            <button class="btn-outline-pink" id="cancelResetBtn">Cancel</button>
                            <button class="btn-filled-pink" id="saveResetBtn">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
    <!-- Modal Setting -->
    <div class="setting-modal hidden" id="settingModal">
        <div class="modal-overlay"></div>
        <div class="modal-personal">
            <i class="bi bi-x close-setting" title="Close" role="button" tabindex="0"></i>
            <h3>Settings</h3>
            <div class="setting-group">
                <label for="fontSizeSelect">Font Size:</label>
                <select id="fontSizeSelect">
                    <option value="small">Small</option>
                    <option value="medium" selected>Medium</option>
                    <option value="large">Large</option>
                </select>
            </div>
            <div class="setting-group">
                <label>Theme:</label>
                <div class="radio-options">
                    <label><input type="radio" name="theme" value="light" checked> Light</label>
                    <label><input type="radio" name="theme" value="dark"> Dark</label>
                </div>
            </div>
            <button id="saveSettingsBtn" class="btn-filled-pink">Save</button>
        </div>
    </div>


    <!-- Giao diện chỉnh sửa note -->
    <div id="popup-modal" class="popup-modal hidden">
        <div class="add-note-expanded popup-content">
            <input type="text" id="modal-title" class="note-title-input" placeholder="Title">
            <textarea id="modal-content" class="note-content-input" placeholder="Content..."></textarea>
            <div class="icons">
            </div>
            <button class="close-add-note" id="popup-close">Close</button>
        </div>
    </div>

    <!-- Modal xác nhận xóa vĩnh viễn -->
    <div id="deleteConfirmModal" class="modal-confirm">
        <div class="modal-content-confirm">
            <div class="modal-title">Delete note permanently?</div>
            <div class="modal-body">
                Are you sure you want to permanently delete this note?
            </div>
            <div class="modal-actions">
                <button id="confirmDeleteBtn" class="btn btn-danger">Delete</button>
                <button id="cancelDeleteBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>

    <script>
        window.renderFilterLabels = () => { }; 
    </script>

    <script src="js/trash.js"></script>
    <script src="js/labels.js"></script>




</body>

</html>