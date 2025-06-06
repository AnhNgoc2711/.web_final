<?php
session_set_cookie_params(0);
session_start();

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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</head>

<body>

    <?php if ($is_active == 0): ?>
        <div
            style="background: #ffcccc; color: #900; padding: 10px; text-align: center; font-weight: bold; border-bottom: 2px solid red;">
            Your account has not been activated yet. Please check your email to activate.
        </div>
    <?php endif; ?>

    <!DOCTYPE html>
    <html lang="vi">

    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SkyNote Website</title>
        <link rel="icon" href="image/icon.png" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" />
        <link rel="stylesheet" href="css/home.css" />

    </head>

    <body>

        <!-- Sidebar -->
        <div class="sidebar" id="sidebar">
            <i class="bi bi-x close-sidebar" title="Close" aria-label="Close sidebar" role="button"
                tabindex="0"></i><br><br>
            <ul>
                <li><i class="bi bi-sticky"></i> <a href="home.php" style="color: inherit; text-decoration: none;"></i>
                        Note</li>
                <li><i class="bi bi-bell"></i> Reminder</li>
                <li><i class="bi bi-archive"></i> Storage</li>
                <li><i class="bi bi-trash"></i> <a href="trash.php"
                        style="color: inherit; text-decoration: none;">Trash</a></li>

            </ul>
            <div class="labels">
                <h4><i class="bi bi-tag"></i> Labels</h4>
                <ul>
                    <li><i class="bi bi-tag"></i> Study</li>
                    <li><i class="bi bi-tag"></i> Work</li>
                    <li><i class="bi bi-plus-circle"></i>Add Label</li>
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
                    <li><i class="bi bi-gear"></i> Setting</li>

                    <li id="logoutBtn"><i class="bi bi-box-arrow-right"></i> Logout</li>
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
                <div class="icons">
                </div>
                <button class="close-add-note" id="popup-close">Close</button>
            </div>
        </div>

        <!-- Modal xác nhận xóa vĩnh viễn -->
        <div id="deleteConfirmModal" class="modal-confirm hidden">
            <div class="modal-content-confirm">
                <div class="modal-title">Delete note permanently?</div>
                <div class="modal-body">
                    Are you sure you want to permanently delete this note? <br>
                </div>
                <div class="modal-actions">
                    <button id="confirmDeleteBtn" class="btn btn-danger">Delete</button>
                    <button id="cancelDeleteBtn" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        </div>





        <script src="js/trash.js"></script>


    </body>

    </html>