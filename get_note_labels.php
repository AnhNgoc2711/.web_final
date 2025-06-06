<?php
require_once 'db.php'; // Kết nối CSDL, tạo biến $pdo

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['label_id'])) {
    $label_id = $_GET['label_id'];

    try {
        if ($label_id == 0) {
            // Lấy tất cả ghi chú và nhãn
            $stmt = $pdo->query("
                SELECT n.*, l.label_id, l.name_label
                FROM note n
                LEFT JOIN note_label nl ON n.note_id = nl.note_id
                LEFT JOIN label l ON nl.label_id = l.label_id
            ");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            // Lấy ghi chú theo nhãn cụ thể và nhãn của từng note
            $stmt = $pdo->prepare("
                SELECT n.*, l.label_id, l.name_label
                FROM note n
                JOIN note_label nl ON n.note_id = nl.note_id
                JOIN label l ON nl.label_id = l.label_id
                WHERE n.note_id IN (
                    SELECT note_id FROM note_label WHERE label_id = ?
                )
            ");
            $stmt->execute([$label_id]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        // Gom nhóm nhãn theo từng note
        $notes = [];
        foreach ($rows as $row) {
            $note_id = $row['note_id'];
            if (!isset($notes[$note_id])) {
                $notes[$note_id] = [
                    'note_id' => $note_id,
                    'user_id' => $row['user_id'],
                    'title' => $row['title'],
                    'content' => $row['content'],
                    'color' => $row['color'],
                    'labels' => []
                ];
            }
            if (!empty($row['label_id'])) {
                $notes[$note_id]['labels'][] = [
                    'label_id' => $row['label_id'],
                    'name_label' => $row['name_label']
                ];
            }
        }

        // Chuyển về mảng số (không dùng key note_id)
        $notes = array_values($notes);

        echo json_encode(['success' => true, 'notes' => $notes]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}
?>
