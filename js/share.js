// Hiển thị tag new khi có note mới, mất vĩnh viển khi click vào
document.addEventListener("DOMContentLoaded", () => {
    const noteCards = document.querySelectorAll(".note-card[data-shared='true']");

    noteCards.forEach((card, index) => {
        const noteId = card.dataset.id || `note-${index}`; // Fallback ID nếu không có

        // Kiểm tra đã đọc hay chưa từ localStorage
        const isRead = localStorage.getItem(`note-read-${noteId}`);
        if (isRead === "true") {
            const newTag = card.querySelector(".new-tag");
            if (newTag) newTag.remove();
        }

        // Gắn sự kiện khi click vào thẻ ghi chú
        card.addEventListener("click", () => {
            const newTag = card.querySelector(".new-tag");
            if (newTag) {
                newTag.remove();
                localStorage.setItem(`note-read-${noteId}`, "true");
            }
            console.log(`Opened note ${noteId}`);
        });
    });
});


// chuyển đổi grid/list
const toggleViewBtn = document.getElementById('toggleViewBtn');
const icon = toggleViewBtn.querySelector('i');
const notesLists = document.querySelectorAll('.notes-list');

toggleViewBtn.addEventListener('click', () => {
    notesLists.forEach((list) => {
        list.classList.toggle('list-view');
        list.classList.toggle('grid-view');
    });

    if (notesLists[0].classList.contains('list-view')) {
        icon.classList.replace('bi-list-task', 'bi-grid-3x3-gap');
        toggleViewBtn.setAttribute('title', 'Grid view');
    } else {
        icon.classList.replace('bi-grid-3x3-gap', 'bi-list-task');
        toggleViewBtn.setAttribute('title', 'List view');
    }
});


// Xem chi tiet ghi chu
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("noteModal");
    const titleEl = document.getElementById("note-title");
    const fromEl = document.getElementById("note-from");
    const dateEl = document.getElementById("note-date");
    const contentEl = document.getElementById("note-text");
    const closeBtn = modal.querySelector(".close-btn");
    const historyIcon = modal.querySelector(".history-icon");
    const historyPanel = document.getElementById("note-history");
    const historyList = document.getElementById("history-list");

    // Giả lập dữ liệu lịch sử
    const mockHistoryData = [
        "Chỉnh sửa tiêu đề lúc 09:00 AM - 06/06/2025",
        "Thêm đoạn mô tả lúc 11:24 AM - 06/06/2025",
        "Sửa quyền chia sẻ lúc 01:05 PM - 06/06/2025"
    ];

    // Lấy tất cả các thẻ note-card
    document.querySelectorAll(".note-card").forEach(card => {
        card.addEventListener("click", () => {
            // Lấy thông tin từ card
            const title = card.querySelector(".note-title")?.textContent || "";
            const from = card.querySelector(".note-share")?.textContent || "";
            const date = card.querySelector(".note-time")?.textContent || "";
            const content = card.querySelector(".note-content")?.textContent || "";

            // Hiển thị trong modal
            titleEl.textContent = title;
            fromEl.textContent = from;
            dateEl.textContent = date;
            contentEl.textContent = content;

            // Hiện modal
            modal.classList.remove("hidden");
        });
    });

    // Đóng modal
    closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    historyIcon.addEventListener("click", () => {
        // Toggle hiển thị lịch sử
        historyPanel.classList.toggle("hidden");

        // Cập nhật danh sách lịch sử
        historyList.innerHTML = "";
        mockHistoryData.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            historyList.appendChild(li);
        });
    });
});