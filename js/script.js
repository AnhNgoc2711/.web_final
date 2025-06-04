function isOnline() {
    return navigator.onLine;
}

// Yêu cầu quyền thông báo
Notification.requestPermission().then(permission => {
    if (permission === "granted") {
        console.log("🔔 Notifications allowed for SkyNote.");
    }
});

// Hiển thị thông báo nếu đã cấp quyền
if ("serviceWorker" in navigator && "Notification" in window) {
    navigator.serviceWorker.ready.then(registration => {
        if (Notification.permission === "granted") {
            registration.showNotification("Welcome to SkyNote!", {
                body: "You can take notes even while offline!",
                icon: "/.web_final/image/icon.png"
            });
        }
    });
}

// Lưu ghi chú offline
function saveNoteOffline(note) {
    let offlineNotes = JSON.parse(localStorage.getItem('offlineNotes')) || [];
    offlineNotes.push(note);
    localStorage.setItem('offlineNotes', JSON.stringify(offlineNotes));
    alert("📴 Bạn đang offline. Ghi chú đã được lưu tạm thời.");
}

// Gửi lại các note bị lưu khi online
window.addEventListener('online', () => {
    let offlineNotes = JSON.parse(localStorage.getItem('offlineNotes')) || [];

    if (offlineNotes.length === 0) return;

    const syncPromises = offlineNotes.map(note => {
        return fetch('/.web_final/add_note.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note)
        })
        .then(res => res.json())
        .then(data => {
            console.log('✅ Đồng bộ thành công:', data);
        })
        .catch(err => console.error('❌ Lỗi đồng bộ:', err));
    });

    Promise.all(syncPromises).then(() => {
        localStorage.removeItem('offlineNotes');
        location.reload(); // Chỉ reload sau khi tất cả note đã đồng bộ
    });
});


// Xử lý form thêm note
document.addEventListener('DOMContentLoaded', () => {
    const noteList = document.querySelector('#noteList');
    noteList.innerHTML = ''; // Xóa hết nội dung trước khi render lại

    // 1. Hiển thị note từ server (nếu có mạng)
    if (navigator.onLine) {
      fetch('/.web_final/get_notes.php')
        .then(res => res.json())
        .then(data => {
          noteList.innerHTML = ''; // Xóa trước khi render
          data.forEach(note => {
            noteList.innerHTML += renderNoteHTML(note);
          });
        })
        .catch(() => {
          // Nếu fetch lỗi, vẫn hiển thị offline notes
          renderOfflineNotes();
        });
    } else {
      renderOfflineNotes();
    }

    function renderOfflineNotes() {
      noteList.innerHTML = '';
      const offlineNotes = JSON.parse(localStorage.getItem('offlineNotes') || '[]');
      offlineNotes.forEach(note => {
        noteList.innerHTML += renderNoteHTML(note, true);
      });
    }
    // 2. Hiển thị note từ localStorage (offline)
    const offlineNotes = JSON.parse(localStorage.getItem('offlineNotes') || '[]');
    offlineNotes.forEach(note => {
      noteList.innerHTML += renderNoteHTML(note, true); // truyền true để đánh dấu là note offline
    });
  });

  // Hàm render HTML cho 1 ghi chú
  function renderNoteHTML(note, isOffline = false) {
    return `
      <div class="note ${isOffline ? 'note-offline' : ''}">
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        ${isOffline ? '<small>(offline)</small>' : ''}
      </div>
    `;
  }






    



    
