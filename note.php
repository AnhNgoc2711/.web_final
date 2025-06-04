<?php
session_start();
require 'db.php'; // $pdo: PDO connection

header('Content-Type: application/json');

// Check login
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];

// ==== TOGGLE ICON ====
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'toggle_icon') {
    $note_id = intval($_POST['note_id']);
    $icon = $_POST['icon']; // pin, lock, share, tag

    if ($icon === 'tag') {
        // Xử lý label
        $stmt = $pdo->prepare("SELECT label_id FROM note_label WHERE note_id = ?");
        $stmt->execute([$note_id]);
        if ($stmt->fetch()) {
            $stmt = $pdo->prepare("DELETE FROM note_label WHERE note_id = ?");
            $stmt->execute([$note_id]);
            echo json_encode(['success' => true, 'tag' => false]);
            exit;
        } else {
            // Gắn label mặc định, VD: label_id = 1
            $stmt = $pdo->prepare("INSERT INTO note_label (label_id, note_id) VALUES (1, ?)");
            $stmt->execute([$note_id]);
            echo json_encode(['success' => true, 'tag' => true]);
            exit;
        }
    }

    // Các trường còn lại
    $allowed = [
        'pin' => 'pinned',
        'lock' => 'locked',
        'share' => 'is_shared'
    ];
    if (!isset($allowed[$icon])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid icon']);
        exit;
    }
    $col = $allowed[$icon];

    // Toggle trạng thái
    $stmt = $pdo->prepare("SELECT $col FROM note WHERE note_id = ? AND user_id = ?");
    $stmt->execute([$note_id, $user_id]);
    $cur = $stmt->fetchColumn();
    $newValue = $cur ? 0 : 1;
    $stmt = $pdo->prepare("UPDATE note SET $col = ? WHERE note_id = ? AND user_id = ?");
    $stmt->execute([$newValue, $note_id, $user_id]);
    echo json_encode(['success' => true, $col => $newValue]);
    exit;
}

// ==== AUTOSAVE: CREATE OR UPDATE NOTE ====
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['action'])) {
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

// ==== LẤY DANH SÁCH NOTE ====
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT note_id, title, content, color, pinned, locked, is_shared, size_type FROM note WHERE user_id = ? AND is_deleted = 0 ORDER BY pinned DESC, updated_at DESC");
    $stmt->execute([$user_id]);
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Check label cho từng note
    foreach ($notes as &$note) {
        $stmt2 = $pdo->prepare("SELECT 1 FROM note_label WHERE note_id = ? LIMIT 1");
        $stmt2->execute([$note['note_id']]);
        $note['has_label'] = $stmt2->fetch() ? 1 : 0;
    }
    echo json_encode($notes);
    exit;
}

// ==== Method không hợp lệ ====
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
exit;
?>
