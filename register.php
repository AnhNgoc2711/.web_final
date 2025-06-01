<?php
session_start();
require 'db.php';
require 'vendor/autoload.php'; 

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST['email'] ?? '';
    $name = $_POST['name'] ?? '';  // đổi thành name
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm'] ?? '';

    // Kiểm tra đầu vào
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

    // Đăng nhập tự động sau khi đăng ký (nhưng tài khoản chưa active)
    $_SESSION['user_id'] = $userId;
    $_SESSION['email'] = $email;
    $_SESSION['fullname'] = $name;
    $_SESSION['is_active'] = 0;
    $_SESSION['just_registered'] = true;

    // Gửi email xác minh
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'anhthunguyne@gmail.com'; 
        $mail->Password = 'dbkl iaov fbnj zuiu'; 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->CharSet = 'UTF-8'; 

        $mail->setFrom('anhthunguyne@gmail.com', 'SkyNote');
        $mail->addAddress($email, $name);

        $verifyLink = "http://localhost/.web_final/verify.php?email=" . urlencode($email) . "&token=" . $token;
        $mail->isHTML(true);
        $mail->Subject = "SkyNote Registration Confirmation";
        $mail->Body = "
            Hello <strong>$name</strong>,<br><br>
            We're excited to have you join SkyNote!<br><br>
            Please click the link below to verify your account:<br>
            <a href='$verifyLink'>Verify Your Account</a><br><br>
            If you did not request this, please ignore this email.<br><br>
            Best regards!
        ";

        $mail->send();

        header("Location: home.php");
        exit;

    } catch (Exception $e) {
        echo "Unable to send verification email. Error: {$mail->ErrorInfo}";
        exit;
    }
}
?>