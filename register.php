<?php
session_start();
require 'db.php';
require 'mailer.php';
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST['email'] ?? '';
    $name = $_POST['name'] ?? '';
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm'] ?? '';

    if (empty($email) || empty($name) || empty($password) || empty($confirmPassword)) {
        $_SESSION['register_error'] = "Please fill in all fields.";
        header("Location: login.php");
        exit;
    }
    if (empty($email)) {
        $_SESSION['register_error'] = "Email is required.";
        header("Location: login.php");
        exit;
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION['register_error'] = "Invalid email format.";
        header("Location: login.php");
        exit;
    }

    if ($password !== $confirmPassword) {
        $_SESSION['register_error'] = "Passwords do not match.";
        header("Location: login.php");
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM USER WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        $_SESSION['register_error'] = "This email has already been registered.";
        header("Location: login.php");
        exit;
    }


    // Tạo user mới
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO USER (email, name, password, is_active) VALUES (?, ?, ?, 0)");
    $stmt->execute([$email, $name, $hashedPassword]);

    $userId = $pdo->lastInsertId();

    // Tạo token cho xác thực email
    $token = bin2hex(random_bytes(16));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 day')); // token hết hạn sau 1 ngày
    $stmt = $pdo->prepare("INSERT INTO TOKEN (user_id, token, type, used, expires_at) VALUES (?, ?, 'activation', 0, ?)");
    $stmt->execute([$userId, $token, $expiresAt]);

    // Đăng nhập tự động sau khi đăng ký 
    $_SESSION['user_id'] = $userId;
    $_SESSION['email'] = $email;
    $_SESSION['fullname'] = $name;
    $_SESSION['is_active'] = 0;
    $_SESSION['just_registered'] = true;


    // Gửi mail xác minh qua hàm đã tối ưu hóa
    $result = send_activation_email($email, $name, $token);

    if ($result === true) {
        header("Location: home.php");
        exit;
    } else {
        echo "Unable to send verification email. Error: $result";
        exit;
    }

}
?>