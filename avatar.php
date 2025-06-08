<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error']);
    exit;
}

$uploadDir = __DIR__ . '/image/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$fileName = basename($_FILES['avatar']['name']);
$fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'gif'];

if (!in_array($fileExt, $allowed)) {
    echo json_encode(['success' => false, 'error' => 'Invalid file type']);
    exit;
}

$newFileName = uniqid('avatar_', true) . '.' . $fileExt;
$targetFile = $uploadDir . $newFileName;

if (!move_uploaded_file($_FILES['avatar']['tmp_name'], $targetFile)) {
    echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file']);
    exit;
}

// Lưu đường dẫn avatar vào DB (tương đối)
$avatarPath = 'image/' . $newFileName;

try {
    $stmt = $pdo->prepare("UPDATE user SET avatar = ? WHERE user_id = ?");
    $stmt->execute([$avatarPath, $user_id]);

    if ($stmt->rowCount() > 0) {
        // Thêm timestamp để tránh cache ảnh cũ khi load lại
        $avatarUrl = $avatarPath . '?t=' . time();
        echo json_encode(['success' => true, 'message' => 'Avatar updated', 'avatarUrl' => $avatarUrl]);
    } else {
        echo json_encode(['success' => false, 'error' => 'User not found or no change']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error: ' . $e->getMessage()]);
}
