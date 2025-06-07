<?php
session_start();
require 'db.php'; 

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    //LẤY DANH SÁCH NOTE 
    $stmt = $pdo->prepare("SELECT * FROM note WHERE user_id = ? AND is_deleted = 0 ORDER BY pinned DESC, updated_at DESC");
    $stmt->execute([$user_id]);
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Gắn labels vào từng note
    foreach ($notes as &$note) {
        $note_id = $note['note_id'];
        $stmtLabel = $pdo->prepare("
            SELECT l.label_id, l.name_label
            FROM note_label nl
            JOIN label l ON nl.label_id = l.label_id
            WHERE nl.note_id = ? AND l.user_id = ?
        ");
        $stmtLabel->execute([$note_id, $user_id]);
        $note['labels'] = $stmtLabel->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($notes);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // AUTOSAVE
    $title = $_POST['title'] ?? '';
    $content = $_POST['content'] ?? '';
    $color = $_POST['color'] ?? null;
    $note_id = $_POST['note_id'] ?? null;
    $labels = $_POST['labels'] ?? [];
    if (!is_array($labels)) {
        $labels = [];
    }


    if ($note_id) {
        $_SESSION['current_note_id'] = $note_id;

        $stmt = $pdo->prepare("UPDATE note SET title=?, content=?, color=?, updated_at=NOW() WHERE note_id=? AND user_id=?");
        $stmt->execute([$title, $content, $color, $note_id, $user_id]);
        $stmtDelete->execute([$note_id]);

        $stmtInsert = $pdo->prepare("INSERT INTO note_label (note_id, label_id) VALUES (?, ?)");
        foreach ($labels as $label_id) {
            $stmtInsert->execute([$note_id, $label_id]);
        }
        echo json_encode(['note_id' => $note_id, 'status' => 'updated']);
    } else {
        $stmt = $pdo->prepare("INSERT INTO note (user_id, title, content, color) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $title, $content, $color]);
        $new_note_id = $pdo->lastInsertId();
        // Thêm labels cho note mới
        $stmtInsert = $pdo->prepare("INSERT INTO note_label (note_id, label_id) VALUES (?, ?)");
        foreach ($labels as $label_id) {
            $stmtInsert->execute([$new_note_id, $label_id]);
        }

        $_SESSION['current_note_id'] = $new_note_id;

        echo json_encode(['note_id' => $new_note_id, 'status' => 'created']);
    }

    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
exit;
?>