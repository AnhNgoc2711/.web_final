<?php
session_start();
require 'config.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo "<script>alert('Please enter both email and password.'); window.history.back();</script>";
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        echo "<script>alert('Email not found.'); window.history.back();</script>";
        exit;
    }

    if (!password_verify($password, $user['password'])) {
        echo "<script>alert('Incorrect password.'); window.history.back();</script>";
        exit;
    }

    // Lưu thông tin user và trạng thái kích hoạt vào session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['fullname'] = $user['fullname'];
    $_SESSION['is_active'] = $user['is_active'];


    echo "<script>alert('Login successful!'); window.location.href = 'home.php';</script>";
    exit;
} else {
    header("Location: login.php");
    exit;
}
?>
