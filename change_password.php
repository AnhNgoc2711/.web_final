<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true); // Đọc JSON input

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $data['action'] ?? null;

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'reset') {
        $oldPassword = $data['oldPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';
        $confirmPassword = $data['confirmNewPassword'] ?? '';

        if (!$oldPassword || !$newPassword || !$confirmPassword) {
            echo json_encode(['success' => false, 'error' => 'Please fill in all fields']);
            exit;
        }

        if ($newPassword !== $confirmPassword) {
            echo json_encode(['success' => false, 'error' => 'New passwords do not match']);
            exit;
        }

        // Lấy mật khẩu cũ từ DB
        $stmt = $pdo->prepare("SELECT password FROM user WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($oldPassword, $user['password'])) {
            echo json_encode(['success' => false, 'error' => 'Old password is incorrect']);
            exit;
        }

        // Cập nhật mật khẩu mới
        $newHashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $updateStmt = $pdo->prepare("UPDATE user SET password = ? WHERE user_id = ?");
        $updateStmt->execute([$newHashedPassword, $user_id]);

        if ($updateStmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Password not changed']);
        }
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Unknown action or wrong method']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error: ' . $e->getMessage()]);
}
