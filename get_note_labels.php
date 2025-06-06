<?php
header('Content-Type: application/json');
require 'db.php'; // file kết nối db

$label_id = isset($_GET['label_id']) ? intval($_GET['label_id']) : 0;
error_log("Label ID: " . $_GET['label_id']);

if ($label_id === 0) {
    // Trả về tất cả note nếu không lọc
    $sql = "SELECT n.note_id, n.title, n.content FROM note n";
    $stmt = $pdo->query($sql);
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);
} else {
    // Lấy note theo label_id
    $sql = "SELECT n.note_id, n.title, n.content
            FROM note n
            JOIN note_label nl ON n.note_id = nl.note_id
            WHERE nl.label_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$label_id]);
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode([
    'success' => true,
    'notes' => $notes,
]);
