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

$action = $_POST['action'] ?? null;

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
        $labelName = trim($_POST['label'] ?? '');
        if ($labelName === '') {
            echo json_encode(['success' => false, 'error' => 'Label name is empty']);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO label (user_id, name_label) VALUES (?, ?)");
        $stmt->execute([$user_id, $labelName]);
        echo json_encode(['success' => true, 'label_id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($action === 'update') {
        $label_id = (int) ($_POST['label_id'] ?? 0);
        $name_label = trim($_POST['name_label'] ?? '');
        if ($label_id <= 0 || $name_label === '') {
            echo json_encode(['success' => false, 'error' => 'Invalid parameters']);
            exit;
        }
        // Chỉ update nhãn thuộc user hiện tại
        $stmt = $pdo->prepare("UPDATE label SET name_label = ? WHERE label_id = ? AND user_id = ?");
        $stmt->execute([$name_label, $label_id, $user_id]);
        echo json_encode(['success' => $stmt->rowCount() > 0]);
        exit;
    }

    if ($action === 'delete') {
        $label_id = $_POST['label_id'] ?? null;
        if (!$label_id) {
            echo json_encode(['success' => false, 'error' => 'Thiếu label_id']);
            exit;
        }
        try {
            // Xóa nhãn 
            $stmt = $pdo->prepare("DELETE FROM label WHERE label_id = ?");
            $stmt->execute([$label_id]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit;
    }


    echo json_encode(['success' => false, 'error' => 'Unknown action or missing parameters']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error: ' . $e->getMessage()]);
}
