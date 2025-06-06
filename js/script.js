// Lưu ghi chú tạm khi offline
function saveNoteOffline(note) {
    let offlineNotes = JSON.parse(localStorage.getItem('offlineNotes')) || [];
    offlineNotes.push(note);
    localStorage.setItem('offlineNotes', JSON.stringify(offlineNotes));
    showMessage("📴 Bạn đang offline. Ghi chú đã được lưu tạm thời.");
}

// Tự động gửi lại khi có mạng
window.addEventListener('online', () => {
    let offlineNotes = JSON.parse(localStorage.getItem('offlineNotes')) || [];

    if (offlineNotes.length === 0) return;

    const syncPromises = offlineNotes.map(note => {
        return fetch('note.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note)
        })
        .then(res => {
            if (!res.ok) throw new Error("Lỗi fetch");
            return res.json();
        })
        .then(data => {
            console.log('✅ Đồng bộ thành công:', data);
        })
        .catch(err => {
            console.error('❌ Lỗi khi đồng bộ:', err);
        });
    });

    Promise.all(syncPromises).then(() => {
        localStorage.removeItem('offlineNotes');
        location.reload(); // Tải lại giao diện
    });
});

// Bắt sự kiện submit từ form
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#noteForm');
    form.addEventListener('submit', e => {
        e.preventDefault();

        const title = document.querySelector('#title').value;
        const content = document.querySelector('#content').value;
        const color = document.querySelector('#color').value;
        const labels = []; // tự xử lý nếu có checkbox hay tag

        const note = { title, content, color, labels };

        if (!navigator.onLine) {
            saveNoteOffline(note);
            return;
        } else {
            fetch('note.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note)
            })
            .then(res => {
                if (!res.ok) throw new Error("Fetch fail");
                return res.json();
            })
            .then(data => {
                console.log('✅ Ghi chú đã lưu online:', data);
                location.reload();
            })
            .catch(err => {
                console.error('❌ Lỗi khi gửi ghi chú:', err);
                saveNoteOffline(note);
            });
        }
    });

    // Hiển thị note offline
    renderOfflineNotes();
});

function renderOfflineNotes() {
    const list = document.querySelector('#noteList');
    const notes = JSON.parse(localStorage.getItem('offlineNotes') || '[]');

    list.innerHTML = '';
    notes.forEach(note => {
        list.innerHTML += `
            <div class="note note-offline">
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <small>(Đang offline)</small>
            </div>
        `;
    });
}
