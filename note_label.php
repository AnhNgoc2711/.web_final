<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);
require_once 'db.php';

header('Content-Type: application/json');

// Gán nhãn cho ghi chú (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $note_id = $_POST['note_id'] ?? null;
    $label_ids = isset($_POST['label_ids']) ? json_decode($_POST['label_ids'], true) : [];

    if (!$note_id || !is_array($label_ids)) {
        echo json_encode(['success' => false, 'error' => 'Thiếu note_id hoặc label_ids']);
        exit;
    }

    try {
        // Xoá các nhãn cũ
        $stmt = $pdo->prepare("DELETE FROM note_label WHERE note_id = ?");
        $stmt->execute([$note_id]);

        // Thêm nhãn mới
        $stmt = $pdo->prepare("INSERT INTO note_label (note_id, label_id) VALUES (?, ?)");
        foreach ($label_ids as $label_id) {
            $stmt->execute([$note_id, $label_id]);
        }

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Lấy nhãn theo note_id
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $note_id = $_GET['note_id'] ?? null;

    if (!$note_id) {
        echo json_encode(['success' => false, 'error' => 'Thiếu note_id']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT l.label_id, l.name_label
            FROM note_label nl
            JOIN label l ON nl.label_id = l.label_id
            WHERE nl.note_id = ?
        ");
        $stmt->execute([$note_id]);
        $labels = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'labels' => $labels]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Không đúng phương thức
echo json_encode(['success' => false, 'error' => 'Invalid method']);