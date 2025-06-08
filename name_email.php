<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

// $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];
$name = trim($_POST['name'] ?? '');

if ($name === '') {
    echo json_encode(['success' => false, 'error' => 'Name cannot be empty']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE user SET name = ? WHERE user_id = ?");
    $stmt->execute([$name, $user_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Name updated']);
    } else {
        echo json_encode(['success' => false, 'error' => 'No change or user not found']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error: ' . $e->getMessage()]);
}
