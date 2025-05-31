<?php
require_once 'db.php';
require_once 'mailer.php';
header('Content-Type: application/json');


$email = $_POST['email'] ?? '';
$method = $_POST['method'] ?? '';

if (!$email) {
    echo json_encode(['success' => false, 'message' => 'Please enter your email.']);
    exit;
}
$stmt = $pdo->prepare("SELECT user_id FROM USER WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'No account found with this email.']);
    exit;
}


if ($method === 'otp') {
    // Sinh OTP và lưu vào DB
    $otp = random_int(100000, 999999);
    $expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));
    $stmt = $pdo->prepare("INSERT INTO TOKEN (user_id, token, type, expires_at) VALUES (?, ?, 'reset', ?)");
    $stmt->execute([$user['user_id'], $otp, $expires]);

    // Gửi OTP qua mail
    $subject = "SkyNote - Your Password Reset OTP";
    $body = "
        <p>Dear user,</p>
        <p>You have requested to reset your password for your SkyNote account.</p>
        <p><b>Your OTP code:</b></p>
        <p style='font-size:1.7em; font-weight:bold; letter-spacing:4px; color:#2196f3; margin:12px 0 16px 0;'>{$otp}</p>
        <p>This OTP is valid for <b>15 minutes</b>. Please enter this code on the password reset page to continue.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>SkyNote Team</p>
    ";
    $send_result = send_mail($email, $subject, $body);

    if ($send_result === true) {
        echo json_encode([
            'success' => true,
            'method' => 'otp',
            'message' => 'OTP has been sent to your email. Please check and enter it below.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Could not send OTP email. Please try again later.<br>Error: '.$send_result
        ]);
    }
    exit;
}

if ($method === 'link') {
    $token = bin2hex(random_bytes(16));
    $expires = date('Y-m-d H:i:s', strtotime('+30 minutes'));
    $stmt = $pdo->prepare("INSERT INTO TOKEN (user_id, token, type, expires_at) VALUES (?, ?, 'reset', ?)");
    $stmt->execute([$user['user_id'], $token, $expires]);

    $resetLink = "http://localhost/.web_final/reset_password.html?token=$token";
    $subject = "SkyNote - Your Password Reset Link";
    $body = "
        <p>Dear user,</p>
        <p>You have requested to reset your password for your SkyNote account.</p>
        <p>To reset your password, please click the link below :</p>
        <p style='font-size:1.1em; word-break:break-all;'><a href='{$resetLink}'>{$resetLink}</a></p>
        <p>This link is valid for <b>30 minutes</b>. If you did not request a password reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>SkyNote Team</p>
    ";
    $send_result = send_mail($email, $subject, $body);

    if ($send_result === true) {
        echo json_encode([
            'success' => true,
            'method' => 'link',
            'message' => 'Please check your email for the reset link.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Could not send reset link. Please try again later.<br>Error: '.$send_result
        ]);
    }
    exit;
}


echo json_encode([
    'success' => false,
    'message' => 'Invalid method.'
]);

