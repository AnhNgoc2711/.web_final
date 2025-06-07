window.addEventListener("load", () => {
    const searchInput = document.getElementById("searchInput");
    let searchTimeout = null;

    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        const keyword = searchInput.value.trim().toLowerCase();

        searchTimeout = setTimeout(() => {
            if (keyword === "") {
                if (typeof window.fetchNotes === "function") window.fetchNotes();
                return;
            }

            fetch("note.php")
                .then(res => res.json())
                .then(notes => {
                    const filteredNotes = notes.filter(note =>
                        (note.title && note.title.toLowerCase().includes(keyword)) ||
                        (note.content && note.content.toLowerCase().includes(keyword))
                    );

                    console.log("Filtered notes:", filteredNotes);

                    // Thêm điều kiện kiểm tra tồn tại
                    if (typeof window.renderNotes === "function" && document.querySelector(".notes")) {
                        window.renderNotes(filteredNotes);
                    } else {
                        console.error("renderNotes hoặc .notes không khả dụng.");
                    }
                })
                .catch(err => {
                    console.error("Lỗi khi tìm kiếm ghi chú:", err);
                });
        }, 300);
    });
});
