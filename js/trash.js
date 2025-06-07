document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    if (menuToggle && sidebar) menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    if (closeSidebar && sidebar) closeSidebar.addEventListener('click', () => sidebar.classList.remove('active'));

    // User dropdown
    const userIcon = document.querySelector(".bi-person-circle");
    const userDropdown = document.getElementById("userDropdown");
    if (userIcon && userDropdown) userIcon.addEventListener("click", () => userDropdown.classList.toggle("active"));

    const openPersonalInfoBtn = document.getElementById("openPersonalInfo");
    const personalInfoTab = document.getElementById("personalInfoTab");
    const closePersonalInfoBtn = document.querySelector(".close-personal-info");
    if (openPersonalInfoBtn && personalInfoTab && userDropdown)
        openPersonalInfoBtn.addEventListener("click", () => {
            personalInfoTab.classList.add("show");
            userDropdown.classList.add("hide");
        });
    if (closePersonalInfoBtn && personalInfoTab)
        closePersonalInfoBtn.addEventListener("click", () => {
            personalInfoTab.classList.remove("show");
        });
});


function renderNotes(notes) {
    const container = document.querySelector('.notes');
    if (!container) return;
    if (notes.length === 0) {
        container.innerHTML = `<div style="text-align:center;font-weight: 300;margin:30px 0;color:#fff">Empty trash now.</div>`;
        return;
    }

    container.innerHTML = `
        <div class="note-group-title">TRASH</div>
        <div class="note-list">
            ${notes.map(note => generateNoteHTML(note)).join('')}
        </div>
    `;
}

// Hàm tạo HTML cho note
function generateNoteHTML(note) {
    return `
    <div class="note" data-note-id="${note.note_id}">
        <div class="icons">
            <i class="bi bi-arrow-clockwise" data-action="restore" title="Restore"></i>
            <i class="bi bi-trash-fill" data-action="delete_forever" title="Delete"></i>
        </div>
        <div class="content">
            <div class="title">${note.title || note.content || "()"}</div>
            <div class="body">${note.content || ""}</div>
        </div>
    </div>
    `;
}

function fetchTrashNotes() {
    fetch('note.php?trash=1')
        .then(r => r.json())
        .then(renderNotes);
}

//load
fetchTrashNotes();

// Xử lý icon click
document.addEventListener('click', function (e) {
    const icon = e.target.closest('.icons i');
    if (!icon) return;
    const noteDiv = icon.closest('.note');
    if (!noteDiv) return;
    const noteId = noteDiv.getAttribute('data-note-id');
    const action = icon.dataset.action;

    if (action === 'restore') {
        fetch('note.php', {
            method: 'POST',
            body: new URLSearchParams({
                action: 'restore',
                note_id: noteId
            })
        }).then(r => r.json()).then(() => fetchTrashNotes());
    }

    if (action === 'delete_forever') {
        noteIdToDelete = noteId;
        document.getElementById('deleteConfirmModal').classList.remove('hidden');
    }
});


document.getElementById('confirmDeleteBtn').onclick = function () {
    if (!noteIdToDelete) return;
    fetch('note.php', {
        method: 'POST',
        body: new URLSearchParams({
            action: 'delete_forever',
            note_id: noteIdToDelete
        })
    })
        .then(r => r.json())
        .then(() => {
            document.getElementById('deleteConfirmModal').classList.add('hidden');
            fetchTrashNotes();
            noteIdToDelete = null;
        });
};

document.getElementById('cancelDeleteBtn').onclick = function () {
    document.getElementById('deleteConfirmModal').classList.add('hidden');
    noteIdToDelete = null;
};

