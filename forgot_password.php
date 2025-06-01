<?php
require_once 'db.php';
require_once 'mailer.php';
header('Content-Type: application/json');
date_default_timezone_set('Asia/Ho_Chi_Minh');


// 1. XÁC NHẬN OTP
if (isset($_POST['action']) && $_POST['action'] === 'verify_otp') {
    $email = $_POST['email'] ?? '';
    $otp = $_POST['otp'] ?? '';
    if (!$email || !$otp) {
        echo json_encode(['success' => false, 'message' => 'Missing email or OTP.']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT user_id FROM USER WHERE email=?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Email not found.']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT * FROM TOKEN WHERE user_id=? AND token=? AND type='reset' AND expires_at > NOW()");
    $stmt->execute([$user['user_id'], $otp]);
    $row = $stmt->fetch();
    if ($row) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'OTP is incorrect or expired.']);
    }
    exit;
}

// 2. ĐẶT LẠI MẬT KHẨU (sau khi xác thực OTP hoặc qua link)
if (isset($_POST['action']) && $_POST['action'] === 'reset_password') {
    $email = $_POST['email'] ?? '';
    $otp = $_POST['otp'] ?? '';
    $token = $_POST['token'] ?? '';
    $new_password = $_POST['new_password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    if (!$new_password || !$confirm_password || $new_password !== $confirm_password) {
        echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
        exit;
    }
    // Xác nhận theo otp hoặc token
    if ($otp) {
        $stmt = $pdo->prepare("SELECT user_id FROM USER WHERE email=?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Invalid email.']);
            exit;
        }
        $stmt = $pdo->prepare("SELECT * FROM TOKEN WHERE user_id=? AND token=? AND type='reset' AND expires_at > NOW()");
        $stmt->execute([$user['user_id'], $otp]);
        $row = $stmt->fetch();
        if (!$row) {
            echo json_encode(['success' => false, 'message' => 'OTP is incorrect or expired.']);
            exit;
        }
        // Đặt lại mật khẩu mới (hash)
        $hashed = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE USER SET password=? WHERE user_id=?");
        $stmt->execute([$hashed, $user['user_id']]);
        // Xóa OTP khỏi bảng token
        $stmt = $pdo->prepare("DELETE FROM TOKEN WHERE token=? AND user_id=?");
        $stmt->execute([$otp, $user['user_id']]);
        echo json_encode(['success' => true, 'message' => 'Password has been reset!']);
        exit;
    }
    if ($token) {
        $stmt = $pdo->prepare("SELECT * FROM TOKEN WHERE token=? AND type='reset' AND expires_at > NOW()");
        $stmt->execute([$token]);
        $row = $stmt->fetch();
        if (!$row) {
            echo json_encode(['success' => false, 'message' => 'Reset link is invalid or expired.']);
            exit;
        }
        $user_id = $row['user_id'];
        $hashed = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE USER SET password=? WHERE user_id=?");
        $stmt->execute([$hashed, $user_id]);
        // Xóa token
        $stmt = $pdo->prepare("DELETE FROM TOKEN WHERE token=?");
        $stmt->execute([$token]);
        echo json_encode(['success' => true, 'message' => 'Password has been reset!']);
        exit;
    }
    echo json_encode(['success' => false, 'message' => 'Missing OTP or reset link.']);
    exit;
}

// 3. GỬI OTP HOẶC LINK
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
    $otp = random_int(100000, 999999);
    $expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));
    $stmt = $pdo->prepare("INSERT INTO TOKEN (user_id, token, type, created_at, expires_at) VALUES (?, ?, 'reset', NOW(), ?)");


    $stmt->execute([$user['user_id'], $otp, $expires]);
    $subject = "SkyNote - Your Password Reset OTP";
    $body = "<p>Dear user,</p>
        <p>You have requested to reset your password for your SkyNote account.</p>
        <p><b>Your OTP code:</b></p>
        <p style='font-size:1.7em; font-weight:bold; letter-spacing:4px; color:#2196f3; margin:12px 0 16px 0;'>{$otp}</p>
        <p>This OTP is valid for <b>15 minutes</b>. Please enter this code on the password reset page to continue.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br><p>Best regards,<br>SkyNote Team</p>";
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
            'message' => 'Could not send OTP email. Please try again later.<br>Error: ' . $send_result
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
    $body = "<p>Dear user,</p>
        <p>You have requested to reset your password for your SkyNote account.</p>
        <p>To reset your password, please click the link below :</p>
        <a href='{$resetLink}'>Click here to reset your password</a>
        <p>This link is valid for <b>30 minutes</b>. If you did not request a password reset, please ignore this email.</p>
        <br><p>Best regards,<br>SkyNote Team</p>";
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
            'message' => 'Could not send reset link. Please try again later.<br>Error: ' . $send_result
        ]);
    }
    exit;
}

echo json_encode([
    'success' => false,
    'message' => 'OTP is incorrect or expired. (debug: ' . $_POST['otp'] . ')'
]);


