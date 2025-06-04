// function isOnline() {
//     return navigator.onLine;
// }

// document.addEventListener('DOMContentLoaded', function () {
//   const btn = document.getElementById('myBtn');
//   if (btn) {
//     btn.addEventListener('click', function () {
//       // code ở đây
//     });
//   }


//     // document.querySelectorAll(".add-note-btn").forEach(button => {
//     //     button.addEventListener("click", function (event) {
//     //         event.preventDefault();

//     //         if (!isOnline()) {
//     //             alert("⚠️ You are offline. Your note will be saved locally.");
//     //             return;
//     //         }
//     //     });
//     // });
    
// //     function adjustCarouselItems(carouselId) {
// //         const carousel = document.querySelector(`#${carouselId}`);
// //         const inner = carousel.querySelector(".carousel-inner");
// //         const allCards = Array.from(inner.querySelectorAll(".menu_card"));
// //         const isMobile = window.innerWidth <= 576;

// //         inner.innerHTML = "";

// //         if (isMobile) {
// //             allCards.forEach((card, index) => {
// //                 const slide = document.createElement("div");
// //                 slide.classList.add("carousel-item");
// //                 if (index === 0) slide.classList.add("active");

// //                 const box = document.createElement("div");
// //                 box.classList.add("menu_box");
// //                 box.appendChild(card);

// //                 slide.appendChild(box);
// //                 inner.appendChild(slide);
// //             });
// //         } else {
// //             const chunkSize = 4;
// //             for (let i = 0; i < allCards.length; i += chunkSize) {
// //                 const slide = document.createElement("div");
// //                 slide.classList.add("carousel-item");
// //                 if (i === 0) slide.classList.add("active");

// //                 const box = document.createElement("div");
// //                 box.classList.add("menu_box");

// //                 allCards.slice(i, i + chunkSize).forEach(card => box.appendChild(card));
// //                 slide.appendChild(box);
// //                 inner.appendChild(slide);
// //             }
// //         }
// //     }

// //     ["carouselExample", "carouselExample1", "carouselExample2"].forEach(id => {
// //         adjustCarouselItems(id);
// //     });

// //     window.addEventListener("resize", () => {
// //         ["carouselExample", "carouselExample1", "carouselExample2"].forEach(id => {
// //             adjustCarouselItems(id);
// //         });
// //     });
// //     loadOrderFromLocalStorage();

// });

// Notification.requestPermission().then(permission => {
//     if (permission === "granted") {
//         console.log("🔔 Notifications allowed for SkyNote.");
//     }
// });

// if ("serviceWorker" in navigator && "Notification" in window) {
//     navigator.serviceWorker.ready.then(registration => {
//         // Kiểm tra người dùng đã cấp quyền chưa
//         if (Notification.permission === "granted") {
//             registration.showNotification("Welcome to SkyNote!", {
//                 body: "You can take notes even while offline!",
//                 icon: "image/icon.png"
//             });
//         } else if (Notification.permission !== "denied") {
//             // Nếu chưa cấp quyền, hỏi người dùng
//             Notification.requestPermission().then(permission => {
//                 if (permission === "granted") {
//                     registration.showNotification("Welcome to SkyNote!", {
//                         body: "You can take notes even while offline!",
//                         icon: "image/icon.png"
//                     });
//                 }
//             });
//         }
//     });
// }


// // let deferredPrompt;

// // window.addEventListener('beforeinstallprompt', (e) => {
// //   e.preventDefault(); // Ngăn trình duyệt tự động hiển thị popup
// //   deferredPrompt = e;

// //   const installBtn = document.getElementById('installBtn');
// //   if (installBtn) {
// //     installBtn.style.display = 'block';

// //     installBtn.addEventListener('click', () => {
// //       installBtn.style.display = 'none';
// //       deferredPrompt.prompt();

// //       deferredPrompt.userChoice.then(choiceResult => {
// //         if (choiceResult.outcome === 'accepted') {
// //           console.log('Người dùng đã cài PWA');
// //         } else {
// //           console.log('Người dùng từ chối cài PWA');
// //         }
// //         deferredPrompt = null;
// //       });
// //     });
// //   }
// // });

// function saveNote(title, content) {
//   const note = {
//     title,
//     content,
//     created_at: new Date().toISOString()
//   };

//   if (navigator.onLine) {
//     // Gửi lên server nếu online
//     fetch('/.web_final/api/saveNote.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(note)
//     });
//   } else {
//     // Lưu local nếu offline
//     const offlineNotes = JSON.parse(localStorage.getItem('offlineNotes') || '[]');
//     offlineNotes.push(note);
//     localStorage.setItem('offlineNotes', JSON.stringify(offlineNotes));

//     alert("Ghi chú đã được lưu tạm. Sẽ tự động gửi khi có mạng.");
//   }
// }







  



  


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






    



    