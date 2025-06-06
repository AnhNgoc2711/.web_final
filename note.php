<?php
session_start();
require 'db.php'; // $pdo

header('Content-Type: application/json');

// Check login
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}
$user_id = $_SESSION['user_id'];

// --- TỰ ĐỘNG XÓA NOTE SAU 7 NGÀY TRONG THÙNG RÁC ---
$pdo->prepare("
    DELETE FROM note WHERE is_deleted=1 AND deleted_at IS NOT NULL AND deleted_at < (NOW() - INTERVAL 7 DAY)
")->execute();



// === POST: Hành động với note ===
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // 1. Autosave: Tạo hoặc cập nhật note

    if ($action === '' && isset($_POST['title'])) {
        $title = $_POST['title'] ?? '';
        $content = $_POST['content'] ?? '';
        $color = $_POST['color'] ?? null;
        $size_type = $_POST['size_type'] ?? 'H2';
        $note_id = $_POST['note_id'] ?? null;

        if ($note_id) {
            $stmt = $pdo->prepare("UPDATE note SET title=?, content=?, color=?, size_type=?, updated_at=NOW() WHERE note_id=? AND user_id=?");
            $stmt->execute([$title, $content, $color, $size_type, $note_id, $user_id]);
            echo json_encode(['note_id' => $note_id, 'status' => 'updated']);
        } else {
            $stmt = $pdo->prepare("INSERT INTO note (user_id, title, content, color, size_type) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$user_id, $title, $content, $color, $size_type]);
            $new_note_id = $pdo->lastInsertId();
            echo json_encode(['note_id' => $new_note_id, 'status' => 'created']);
        }
        exit;
    }

    // 2. Toggle icon (pin, lock, share, tag)
    if ($action === 'toggle_icon') {
        $note_id = intval($_POST['note_id']);
        $icon = $_POST['icon']; // pin, lock, share, tag

        if ($icon === 'tag') {
            // Xử lý gắn/bỏ nhãn (giả sử chỉ 1 nhãn, label_id=1 cho demo)
            $stmt = $pdo->prepare("SELECT label_id FROM note_label WHERE note_id = ?");
            $stmt->execute([$note_id]);
            if ($stmt->fetch()) {
                $stmt = $pdo->prepare("DELETE FROM note_label WHERE note_id = ?");
                $stmt->execute([$note_id]);
                echo json_encode(['success' => true, 'tag' => false]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO note_label (label_id, note_id) VALUES (1, ?)");
                $stmt->execute([$note_id]);
                echo json_encode(['success' => true, 'tag' => true]);
            }
            exit;
        }

        // pin, lock, share
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
        $stmt = $pdo->prepare("SELECT $col FROM note WHERE note_id = ? AND user_id = ?");
        $stmt->execute([$note_id, $user_id]);
        $cur = $stmt->fetchColumn();
        $newValue = $cur ? 0 : 1;
        $stmt = $pdo->prepare("UPDATE note SET $col = ? WHERE note_id = ? AND user_id = ?");
        $stmt->execute([$newValue, $note_id, $user_id]);
        echo json_encode(['success' => true, $col => $newValue]);
        exit;
    }

    // 3. Di chuyển vào trash (xóa mềm)
    if ($action === 'move_to_trash') {
        $note_id = intval($_POST['note_id']);
        $stmt = $pdo->prepare("UPDATE note SET is_deleted = 1, deleted_at = NOW() WHERE note_id = ? AND user_id=?");
        $stmt->execute([$note_id, $user_id]);
        echo json_encode(['success' => true]);
        exit;
    }

    // 4. Khôi phục từ trash
    if ($action === 'restore') {
        $note_id = intval($_POST['note_id']);
        $stmt = $pdo->prepare("UPDATE note SET is_deleted = 0, deleted_at = NULL WHERE note_id = ? AND user_id = ?");
        $stmt->execute([$note_id, $user_id]);
        echo json_encode(['success' => true]);
        exit;
    }

    // 5. Xóa vĩnh viễn
    if ($action === 'delete_forever') {
        $note_id = intval($_POST['note_id']);
        $stmt = $pdo->prepare("DELETE FROM note WHERE note_id = ? AND user_id = ?");
        $stmt->execute([$note_id, $user_id]);
        echo json_encode(['success' => true]);
        exit;
    }

    // 6. Cập nhật size_type
    if ($_POST['action'] === 'set_size_type') {
        $note_id = intval($_POST['note_id']);
        $size_type = $_POST['size_type']; // H1, H2, H3

        // Cập nhật vào cơ sở dữ liệu
        $stmt = $pdo->prepare("UPDATE note SET size_type = ? WHERE note_id = ?");
        $stmt->execute([$size_type, $note_id]);

        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid action']);
    exit;
}

// === GET: Lấy notes ===
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Trang trash
    if (isset($_GET['trash']) && $_GET['trash'] == 1) {
        $stmt = $pdo->prepare("SELECT * FROM note WHERE user_id = ? AND is_deleted = 1 ORDER BY pinned DESC, deleted_at DESC");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }
    // Trang home: note chưa xóa
    $stmt = $pdo->prepare("SELECT * FROM note WHERE user_id = ? AND is_deleted = 0 ORDER BY pinned DESC, updated_at DESC");
    $stmt->execute([$user_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
exit;
?>