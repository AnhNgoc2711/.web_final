<?php
session_start();
require 'db.php';
require 'vendor/autoload.php'; 

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST['email'] ?? '';
    $fullname = $_POST['fullname'] ?? '';
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm'] ?? '';

    if ($password !== $confirmPassword) {
        echo "Passwords do not match.";
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM user WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo "This email has already been registered.";
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    $token = bin2hex(random_bytes(16));

    $stmt = $pdo->prepare("INSERT INTO user (email, name, password, is_active, token) VALUES (?, ?, ?, 0, ?)");
    $stmt->execute([$email, $fullname, $hashedPassword, $token]);

    $userId = $pdo->lastInsertId();

    $_SESSION['user_id'] = $userId;
    $_SESSION['email'] = $email;
    $_SESSION['fullname'] = $fullname;
    $_SESSION['is_active'] = 0; 
    $_SESSION['just_registered'] = true;

    header("Location: home.php");
    
    $mail = new PHPMailer(true);
    try {
        if (empty($email)) {
            echo "Email is required.";
            exit;
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo "Invalid email format (e.g., name@gmail.com).";
            exit;
        }

        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'anhthunguyne@gmail.com'; 
        $mail->Password = 'dbkl iaov fbnj zuiu'; 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->CharSet = 'UTF-8'; 

        $mail->setFrom('anhthunguyne@gmail.com', 'SkyNote');
        $mail->addAddress($email, $fullname);

        $verifyLink = "http://localhost/.web_final/verify.php?email=" . urlencode($email) . "&token=" . $token;
        $mail->isHTML(true);
        $mail->Subject = "SkyNote Registration Confirmation";
        $mail->Body = "Hello <strong>$fullname</strong>,<br><br>We're excited to have you join SkyNote! To complete your registration, please click the link below to verify your account:<br><br><a href='$verifyLink'>Verify Your Account</a><br><br>If you did not request this, please ignore this email.<br><br>Best regards!";

        $mail->send();
    } catch (Exception $e) {
        echo "Unable to send verification email. Error: {$mail->ErrorInfo}";
        exit;
    }

    echo "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <title>Notification</title>
        <script>
            window.onload = function() {
                alert('Registration successful! Please check your email to verify your account.');
                window.location.href = 'home.php';
            };
        </script>
    </head>
    <body>
    </body>
    </html>
    ";
}
?>
