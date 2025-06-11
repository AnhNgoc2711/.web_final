<?php
session_set_cookie_params(0);
session_start();

require 'db.php'; // Thêm dòng này để có biến $pdo

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

if ($_SESSION['user_id']) {
    $stmt = $pdo->prepare("SELECT name, email, avatar FROM user WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
} else {
    $user = ['name' => 'Username', 'email' => 'user@example.com', 'avatar' => 'default-avatar.png'];
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
    <link rel="icon" href="/image/icon.png?v=1234" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" />
    <link rel="stylesheet" href="css/home.css" />
    <link rel="manifest" href="manifest.json">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/connect.js"> </script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/themes/classic.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/pickr.min.js"></script>

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
            </li>
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
            <input type="text" id="searchInput" placeholder="Search..." aria-label="Search notes" />
            <i class="bi bi-list-task" id="toggleViewBtn" title="List view"></i>
            <?php if (!empty($user['avatar'])): ?>
                <img src="<?= htmlspecialchars($user['avatar']) ?>" id="topAvatar" title="User account" alt="User Avatar"
                    style="width:30px; height:40px; border-radius:50%;" />
            <?php else: ?>
                <img src="image/icon.png" id="topAvatar" title="User account"
                    style="width:30px; height:40px; border-radius:50%;"></img>
            <?php endif; ?>

        </div>

        <div class="add-note-bar">
            <input type="text" class="add-note-input" placeholder="New note..." readonly onclick="expandAddNote()" />
            <div class="add-note-icons">
                <i class="bi bi-image" title="Add picture"></i>
                <i class="bi bi-palette" title="Note color"></i>
            </div>
        </div>

        <div class="add-note-expanded hidden">
            <input type="text" class="note-title-input" placeholder="Title">
            <textarea class="note-content-input" placeholder="Content..."></textarea>
            <div class="expanded-note-icons" style="display: flex; gap: 8px; align-items: center;">

                <span class="size-type-wrapper" style="position: relative; display: inline-block;">
                    <i class="bi bi-type" id="font-size-icon" title="Font size"></i>
                    <div class="size-type-popup hidden">
                        <div class="size-option" data-size="H1">H1</div>
                        <div class="size-option" data-size="H2">H2</div>
                        <div class="size-option" data-size="H3">H3</div>
                    </div>
                </span>

                <i class="bi bi-image" title="Add picture"></i>
                <i class="bi bi-palette" title="Note color"></i>
                <i class="bi bi-pin-angle" title="Pin"></i>
                <i class="bi bi-share" title="Share"></i>
                <i class="bi bi-lock" title="Lock"></i>
                <i id="label-icon" class="bi bi-tag" data-action="tag" title="Label"></i>

                <button class="close-add-note" type="button" title="Close">Close</button>
            </div>
        </div>


        <!-- Vị trí hiển thị danh sách note -->
        <div class="notes" aria-live="polite">
        </div>
    </div>


    <!-- Model phân quyền chia sẽ note -->
    <div id="shareModal" class="modal-share hidden">
        <div>
            <h3>Share Note With</h3>

            <div class="input-row">
                <input type="email" id="emailInput" placeholder="Enter email address">
                <select id="permissionSelect">
                    <option value="view">View only</option>
                    <option value="edit">Can edit</option>
                </select>
                <button class="btn" onclick="addUser()">Add</button>
            </div>

            <!-- Shared user list -->
            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Permission</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="userTableBody">
                    <!-- Rendered by JS -->
                </tbody>
            </table>

            <!-- Footer -->
            <div class="footer">
                <button class="btn-outline-submit" onclick="closeModal()">Cancel</button>
                <button class="btn-submit" onclick="saveShareSettings()">Done</button>
            </div>
        </div>
    </div>


    <!-- Sidebar người dùng -->
    <div class="user-dropdown-container">
        <div class="user-dropdown" id="userDropdown">
            <div class="user-header">
                <img src="<?= htmlspecialchars($user['avatar'] ?: 'image/background.jpg') ?>" alt="Avatar"
                    class="user-avatar" id="topAvatar" title="User account"
                    style="width:50px; height:50px; border-radius:50%;" />
                <div class="user-name" id="userName"><?= htmlspecialchars($user['name'] ?: 'Username') ?></div>
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
                    <img src="<?= htmlspecialchars($user['avatar'] ?: 'image/icontitle.jpg') ?>" alt="Avatar"
                        class="avatar-edit-preview" id="avatarPreview" />
                    <label for="avatarInput" id="avatarLabel" class="avatar-upload-btn">Change my avatar</label>
                    <input type="file" id="avatarInput" accept="image/*" class="hidden" />

                    <!-- Hiển thị tên -->
                    <h3 id="displayName"><?= htmlspecialchars($user['name']) ?></h3>
                    <input type="text" class="hidden" id="nameInput" value="Tên người dùng" />
                    <!-- Email -->
                    <p id="emailDisplay">Email: <span id="userEmail"><?= htmlspecialchars($user['email']) ?></span></p>
                    <div class="personal-info-buttons" id="viewButtons">
                        <button class="btn-outline-pink" id="resetPasswordBtn">Change Password</button>
                        <button class="btn-filled-pink" id="editInfoBtn">Edit Information</button>
                    </div>
                    <div class="personal-info-buttons hidden" id="editActions">
                        <button class="btn-outline-pink" id="cancelEditBtn">Cancel</button>
                        <button class="btn-filled-pink" id="saveEditBtn">Save</button>
                    </div>


                    <!-- Form đổi mật khẩu -->
                    <div class="reset-password-form hidden" id="resetPasswordForm">
                        <div class="password-field">
                            <input type="password" id="oldPassword" placeholder="Enter old password" />
                            <i class="bi bi-eye-slash toggle-password"></i>
                        </div>
                        <div class="password-field">
                            <input type="password" id="newPassword" placeholder="Enter new password" />
                            <i class="bi bi-eye-slash toggle-password"></i>
                        </div>
                        <div class="password-field">
                            <input type="password" id="confirmNewPassword" placeholder="Re-enter new password" />
                            <i class="bi bi-eye-slash toggle-password"></i>
                        </div>
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
            <div id="modal-content" class="note-content-input contenteditable size-h2" contenteditable="true"
                data-placeholder="Content..."></div>

            <div id="selected-labels" style="margin-top:10px; display:none;"></div>
            <div class="icons"></div>

            <!-- Change Note Password Form -->
            <div id="changeNotePasswordForm" class="reset-note-password-form hidden">
                <div class="form-header">
                    <h3 class="form-title">Change Note Password</h3>
                </div>
                <div class="password-field">
                    <input type="password" id="oldNotePassword" placeholder="Enter old note password" />
                    <i class="bi bi-eye-slash toggle-password"></i>
                </div>
                <div class="password-field">
                    <input type="password" id="newNotePassword" placeholder="Enter new note password" />
                    <i class="bi bi-eye-slash toggle-password"></i>
                </div>
                <div class="password-field">
                    <input type="password" id="confirmNewNotePassword" placeholder="Re-enter new note password" />
                    <i class="bi bi-eye-slash toggle-password"></i>
                </div>
                <div class="note-personal-info-buttons">
                    <button class="btn-outline-pink" id="cancelChangeNotePassword">Cancel</button>
                    <button class="btn-filled-pink" id="saveChangeNotePassword">Save</button>
                </div>
            </div>

            <!-- Create/Lock Note Password Form -->
            <div id="createNotePasswordForm" class="reset-note-password-form hidden">
                <div class="form-header">
                    <h3 class="form-title">Create Note Password</h3>
                </div>
                <div class="password-field">
                    <input type="password" id="newCreateNotePassword" placeholder="Enter new note password" />
                    <i class="bi bi-eye-slash toggle-password"></i>
                </div>
                <div class="password-field">
                    <input type="password" id="confirmCreateNotePassword" placeholder="Re-enter new note password" />
                    <i class="bi bi-eye-slash toggle-password"></i>
                </div>
                <div class="note-personal-info-buttons">
                    <button class="btn-outline-pink" id="cancelCreateNotePassword">Cancel</button>
                    <button class="btn-filled-pink" id="saveCreateNotePassword">Save</button>
                </div>
            </div>

            <!-- Enter Note Password Form -->
            <div id="enterNotePasswordForm" class="reset-note-password-form hidden">
                <div class="form-header">
                    <h3 class="form-title">Enter Note Password</h3>
                </div>
                <div class="password-field">
                    <input type="password" id="enterNotePassword" placeholder="Enter note password" />
                    <i class="bi bi-eye-slash toggle-password"></i>
                </div>
                <div class="note-personal-info-buttons">
                    <button class="btn-outline-pink" id="cancelEnterNotePassword">Cancel</button>
                    <button class="btn-filled-pink" id="submitEnterNotePassword">Submit</button>
                </div>
                <div id="enterPasswordError" class="error"></div>
            </div>


            <div id="label-popup"
                style="display:none; position:absolute; background:#fff; border:1px solid #ccc; padding:8px; border-radius:4px; z-index:1000;">
                <strong>Labels</strong>
                <ul id="label-list"
                    style="list-style:none; padding:0; margin:4px 0; max-height:120px; overflow-y:auto;"></ul>
                <div style="display:flex; gap:6px; margin-top:8px;">
                    <input type="text" id="new-label-input" placeholder="Enter name label" style="flex:1;" />
                    <button id="add-label-btn" disabled>Add</button>
                </div>
            </div>
            <button class="close-add-note" id="popup-close">Close</button>
        </div>
    </div>

    <!-- Modal xác nhận xóa -->
    <div id="deleteConfirmModal" class="modal-confirm ">
        <div class="modal-content-confirm">
            <div class="modal-title">Delete note?</div>
            <div class="modal-body">
                Are you sure you want to delete this note? <br>
            </div>
            <div class="modal-actions">
                <button id="confirmDeleteBtn" class="btn btn-danger">Delete</button>
                <button id="cancelDeleteBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>


    <!-- <script src="js/script.js"></script> -->
    <script src="js/login.js"></script>
    <script src="js/home.js"></script>
    <script src="js/search.js"></script>
    <script src="js/filterNotesByLabel.js"></script>
    <script src="js/labels.js"></script>
    <script src="js/note_label.js"></script>
    <script src="js/avatar.js"></script>
    <script src="js/name_email.js"></script>


</body>

</html>