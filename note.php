<?php
session_start();
require 'db.php'; // Đảm bảo đã có biến $pdo

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // === LẤY DANH SÁCH NOTE ===
    $stmt = $pdo->prepare("SELECT * FROM note WHERE user_id = ? AND is_deleted = 0 ORDER BY pinned DESC, updated_at DESC");
    $stmt->execute([$user_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // === TẠO HOẶC UPDATE NOTE (AUTOSAVE) ===
    $title = $_POST['title'] ?? '';
    $content = $_POST['content'] ?? '';
    $color = $_POST['color'] ?? null;
    $note_id = $_POST['note_id'] ?? null;

    if ($note_id) {
        $stmt = $pdo->prepare("UPDATE note SET title=?, content=?, color=?, updated_at=NOW() WHERE note_id=? AND user_id=?");
        $stmt->execute([$title, $content, $color, $note_id, $user_id]);
        echo json_encode(['note_id' => $note_id, 'status' => 'updated']);
    } else {
        $stmt = $pdo->prepare("INSERT INTO note (user_id, title, content, color) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $title, $content, $color]);
        $new_note_id = $pdo->lastInsertId();
        echo json_encode(['note_id' => $new_note_id, 'status' => 'created']);
    }
    exit;
}

// Nếu không phải GET hoặc POST thì báo lỗi:
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
exit;
?>