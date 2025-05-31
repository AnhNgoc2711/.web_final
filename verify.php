<?php
require 'db.php';

$email = $_GET['email'] ?? '';
$token = $_GET['token'] ?? '';
$message = '';
$success = false;

if ($email && $token) {
<<<<<<< HEAD
    // 1. Tìm user theo email
    $stmtUser = $pdo->prepare("SELECT user_id, is_active FROM `USER` WHERE email = ?");
    $stmtUser->execute([$email]);
    $user = $stmtUser->fetch();

    if ($user) {
        if ($user['is_active']) {
            $message = "🎉 Your account is already activated!";
            $success = true;
        } else {
            // 2. Kiểm tra token có hợp lệ trong bảng TOKEN
            $stmtToken = $pdo->prepare("SELECT token_id, used, expires_at FROM TOKEN WHERE user_id = ? AND token = ? AND type = 'activation'");
            $stmtToken->execute([$user['user_id'], $token]);
            $tokenRow = $stmtToken->fetch();

            if ($tokenRow) {
                if ($tokenRow['used']) {
                    $message = "❌ This activation link has already been used.";
                } else {
                    $now = date('Y-m-d H:i:s');
                    if ($tokenRow['expires_at'] && $tokenRow['expires_at'] < $now) {
                        $message = "❌ This activation link has expired.";
                    } else {
                        // 3. Cập nhật active user và đánh dấu token đã dùng
                        $pdo->beginTransaction();

                        $stmtUpdateUser = $pdo->prepare("UPDATE `USER` SET is_active = 1 WHERE user_id = ?");
                        $stmtUpdateUser->execute([$user['user_id']]);

                        $stmtUpdateToken = $pdo->prepare("UPDATE TOKEN SET used = 1 WHERE token_id = ?");
                        $stmtUpdateToken->execute([$tokenRow['token_id']]);

                        $pdo->commit();

                        $message = "🎉 Your account has been successfully activated!";
                        $success = true;
                    }
                }
            } else {
                $message = "❌ The verification link is invalid.";
            }
        }
=======
    $stmt = $pdo->prepare("SELECT * FROM user WHERE email = ? AND token = ?");
    $stmt->execute([$email, $token]);
    $user = $stmt->fetch();

    if ($user) {
        $stmt = $pdo->prepare("UPDATE user SET is_active = 1, token = NULL WHERE email = ?");
        $stmt->execute([$email]);
        $message = "🎉 Your account has been successfully activated!";
        $success = true;
>>>>>>> 5a9701d (Reset OTP + link)
    } else {
        $message = "❌ User not found.";
    }
} else {
    $message = "⚠️ Missing verification details.";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Account Verification | SkyNote</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(to top, #87ceeb, #ffffff);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            font-family: 'Segoe UI', sans-serif;
        }
        .cloud {
            background: #fff;
            border-radius: 50%;
            position: absolute;
            animation: float 30s linear infinite;
        }
        .cloud1 {
            width: 200px; height: 60px; top: 80px; left: 10%;
        }
        .cloud2 {
            width: 150px; height: 50px; top: 150px; left: 60%;
        }
        .cloud3 {
            width: 180px; height: 55px; top: 250px; left: 30%;
        }
        @keyframes float {
            0% { transform: translateX(0); }
            100% { transform: translateX(100vw); }
        }
        .verify-box {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            padding: 40px;
            max-width: 420px;
            text-align: center;
            position: relative;
            z-index: 10;
        }
        .verify-box h2 {
            font-size: 28px;
            margin-bottom: 20px;
            color: <?= $success ? '#28a745' : '#dc3545' ?>;
        }
        .verify-box p {
            font-size: 17px;
            color: #333;
        }
        .verify-box a {
            display: inline-block;
            margin-top: 24px;
            text-decoration: none;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
        }
        .verify-box a:hover {
            background-color: #0056b3;
        }
        .icon {
            font-size: 48px;
            margin-bottom: 12px;
        }
    </style>
</head>
<body>

    <!-- Floating Clouds -->
    <div class="cloud cloud1"></div>
    <div class="cloud cloud2"></div>
    <div class="cloud cloud3"></div>

    <!-- Verification Box -->
    <div class="verify-box">
        <div class="icon">
            <?= $success ? '🌤️' : '🌧️' ?>
        </div>
        <h2><?= $success ? '✅ Verification Successful' : '❌ Verification Failed' ?></h2>
        <p><?= htmlspecialchars($message) ?></p>
        <a href="<?= $success ? 'home.php' : 'login.html' ?>">
            <?= $success ? 'Go to SkyNote' : 'Back to Login' ?>
        </a>
    </div>

</body>
</html>