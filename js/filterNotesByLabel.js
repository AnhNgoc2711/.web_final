(() => {
    let notes = [];
    window.labels = [];                    // đã có trong labels.js
    window.selectedFilterLabelId = null;   // để track label đang chọn

    const filterLabelListEl = document.getElementById('labelList');
    const notesContainer = document.querySelector('.notes');

    // Nhận event khi labels được cập nhật
    document.addEventListener("labelsUpdated", e => {
        window.labels = e.detail;
        renderFilterLabels();
    });

    //list labels ở sidebar
    function renderFilterLabels() {
        if (!filterLabelListEl) return;
        filterLabelListEl.innerHTML = '';

        // All Notes
        const allLi = document.createElement('li');
        allLi.textContent = 'All Notes';
        allLi.style.cursor = 'pointer';
        allLi.style.fontWeight = window.selectedFilterLabelId === null ? 'bold' : 'normal';
        allLi.onclick = () => {
            window.selectedFilterLabelId = null;
            renderFilterLabels();
            loadNotesByLabel(0);
        };
        filterLabelListEl.appendChild(allLi);

        // Các label còn lại
        window.labels.forEach(label => {
            const li = document.createElement('li');
            li.textContent = label.name_label;
            li.style.cursor = 'pointer';
            li.style.fontWeight = window.selectedFilterLabelId === label.label_id ? 'bold' : 'normal';
            li.onclick = () => {
                window.selectedFilterLabelId = label.label_id;
                renderFilterLabels();
                loadNotesByLabel(label.label_id);
            };
            filterLabelListEl.appendChild(li);
        });
    }
    window.renderFilterLabels = renderFilterLabels;

    // Load notes từ server theo label
    async function loadNotesByLabel(label_id = 0) {
        try {
            const res = await fetch(`get_note_labels.php?label_id=${label_id}`);
            const data = await res.json();
            if (data.success) {
                notes = data.notes;
                renderFilteredNotes();
            } else {
                alert("Không lấy được ghi chú");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi mạng khi tải ghi chú");
        }
    }

    // Hàm render dùng wrapper và helper từ home.js
    function renderFilteredNotes() {
        if (!notesContainer) return;

        const html = `
      <div class="note-group">
        <div class="note-list">
          ${notes.map(n => window.generateNoteHTML(n)).join('')}
        </div>
      </div>
    `;
        notesContainer.innerHTML = html;

        // Re-bind icon & click events (pin/share/tag/modal…)
        window.attachIconEvents();
        window.attachNoteClickEvents();
    }

    // Khởi tạo khi DOM xong
    document.addEventListener('DOMContentLoaded', () => {
        renderFilterLabels();
        loadNotesByLabel(0);  // load all notes lần đầu
    });
})();
