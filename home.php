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
    header("Location: login.html");
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
</head>
<body>

<?php if ($is_active == 0): ?>
<div style="background: #ffcccc; color: #900; padding: 10px; text-align: center; font-weight: bold; border-bottom: 2px solid red;">
    Your account has not been activated yet. Please check your email to activate.
</div>
<?php endif; ?>

<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SkyNote Website</title>
    <link rel="icon" href="image/icontitle.jpg" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" />
    <link rel="stylesheet" href="css/home.css" />

</head>

<body>

    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
        <ul>
            <li><i class="bi bi-sticky"></i> Ghi chú</li>
            <li><i class="bi bi-bell"></i> Lời nhắc</li>
            <li><i class="bi bi-archive"></i> Lưu trữ</li>
            <li><i class="bi bi-trash"></i> Thùng rác</li>
        </ul>
        <div class="labels">
            <h4><i class="bi bi-tag"></i> Labels</h4>
            <ul>
                <li><i class="bi bi-tag"></i> Học tập</li>
                <li><i class="bi bi-tag"></i> Công việc</li>
            </ul>
        </div>
    </div>

    <!-- Main -->
    <div class="main" style="margin-left: 0; transition: margin-left 0.3s ease;">
        <div class="top-bar">
            <i class="bi bi-list" id="menuToggle" aria-label="Toggle menu" role="button" tabindex="0"></i>
            <h2><i class="bi bi-cloudy"></i> SkyNote</h2>
            <input type="text" placeholder="Tìm kiếm..." aria-label="Tìm kiếm ghi chú" />
            <i class="bi bi-grid-3x3-gap" title="Chế độ xem lưới"></i>
            <i class="bi bi-person-circle" title="Tài khoản người dùng"></i>
        </div>

        <div class="notes" aria-live="polite">
            <div class="note" tabindex="0" aria-label="Ghi chú tiêu đề">
                <div class="icons">
                    <i class="bi bi-pin-angle" title="Ghim"></i>
                    <i class="bi bi-share" title="Chia sẻ"></i>
                    <i class="bi bi-lock" title="Khóa"></i>
                </div>
                <img src="image/anh1.png" alt="Ảnh minh họa ghi chú" />
                <p><strong>Tiêu đề ghi chú</strong></p>
                <p>Nội dung...</p>
            </div>
        </div>
    </div>

    <script>
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        const mainContent = document.querySelector('.main');

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');

            if (sidebar.classList.contains('active')) {
                mainContent.style.marginLeft = sidebar.offsetWidth + 'px';
            } else {
                mainContent.style.marginLeft = '0';
            }
        });
        menuToggle.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                menuToggle.click();
            }
        });
    </script>

    <script>
        // Nếu người dùng mở tab mới hoặc reload -> sessionStorage không còn
        if (!sessionStorage.getItem('home_accessed')) {
            // Tab này chưa được cấp quyền truy cập → về login
            window.location.href = 'login.html';
        } else {
            // Tab đang hoạt động bình thường
            console.log('Tab hợp lệ. Tiếp tục truy cập...');
        }

        // Đánh dấu tab đã truy cập lần đầu (sau khi đăng ký hoặc login)
        sessionStorage.setItem('home_accessed', 'true');
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
