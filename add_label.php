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

// Lấy input raw JSON nếu có, nếu không thì dùng $_POST
$contentType = $_SERVER["CONTENT_TYPE"] ?? '';
if (strpos($contentType, 'application/json') !== false) {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);
} else {
    $input = $_POST;
}

$action = $input['action'] ?? null;

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET' || !$action) {
        // Lấy danh sách nhãn của user
        $stmt = $pdo->prepare("SELECT label_id, name_label FROM label WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $labels = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $labels]);
        exit;
    }

    if ($action === 'add') {
        $labelName = trim($input['label'] ?? '');
        if ($labelName === '') {
            echo json_encode(['success' => false, 'error' => 'Label name is empty']);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO label (user_id, name_label) VALUES (?, ?)");
        $stmt->execute([$user_id, $labelName]);
        echo json_encode(['success' => true, 'label_id' => $pdo->lastInsertId()]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Unknown action or missing parameters']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error: ' . $e->getMessage()]);
}



