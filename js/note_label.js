let labels = [];
let selectedLabels = new Set();

document.addEventListener('DOMContentLoaded', () => {

    const labelIcon = document.getElementById('label-icon');
    const labelPopup = document.getElementById('label-popup');
    const labelList = document.getElementById('label-list');
    const newLabelInput = document.getElementById('new-label-input');
    const addLabelBtn = document.getElementById('add-label-btn');

    if (newLabelInput && addLabelBtn) {
        addLabelBtn.disabled = true;
        newLabelInput.addEventListener('input', () => {
            addLabelBtn.disabled = newLabelInput.value.trim() === '';
        });


    }

    // DOM đã tồn tại có thể xử lý sự kiện
    if (labelIcon) {
        labelIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            if (labelPopup.style.display === 'block') {
                labelPopup.style.display = 'none';
            } else {
                labelPopup.style.display = 'block';
                updateSelectedLabelsDisplay();

                if (window.currentNoteId) {
                    loadLabelsForNote(window.currentNoteId);
                } else {
                    console.warn('No note_id selected yet!');
                }
            }
        });
    } else {
        console.error('The #label-icon element does not exist in the DOM.');
    }

    document.addEventListener('click', (e) => {
        if (!labelPopup.contains(e.target) && !labelIcon.contains(e.target)) {
            labelPopup.style.display = 'none';
        }
    });

    function showMessage(msg, duration = 3000) {
        const msgBox = document.getElementById('messageBox');
        // const msgText = document.getElementById('messageText');
        msgText.textContent = msg;
        msgBox.style.display = 'block';

        setTimeout(() => {
            msgBox.style.display = 'none';
        }, duration);
    }

    function renderLabels() {
        const ul = document.getElementById('label-list');
        ul.innerHTML = '';

        labels.forEach(l => {
            const li = document.createElement('li');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = l.label_id;
            cb.checked = selectedLabels.has(l.label_id);

            cb.addEventListener('change', async e => {
                //Cập nhật set của mình
                if (e.target.checked) selectedLabels.add(l.label_id);
                else selectedLabels.delete(l.label_id);

                //Cập nhật hiển thị tag ở dưới modal
                updateSelectedLabelsDisplay();

                //Autosave 
                await saveLabelsForNote(
                    window.currentNoteId,
                    Array.from(selectedLabels)
                );

                window.fetchNotes?.();
            });

            const span = document.createElement('span');
            span.textContent = l.name_label;

            li.append(cb, span);
            ul.append(li);
        });
    }

    function updateSelectedLabelsDisplay() {
        const selectedLabelsContainer = document.getElementById('selected-labels');
        selectedLabelsContainer.innerHTML = '';

        labels.forEach(label => {
            if (selectedLabels.has(label.label_id)) {
                const span = document.createElement('span');
                span.textContent = label.name_label;
                span.classList.add('label-tag');
                selectedLabelsContainer.appendChild(span);
            }
        });
    }

    async function loadLabelsFromDB() {
        try {
            const res = await fetch('label.php');
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                labels = data.data;
                renderLabels();
            } else {
                showMessage('Error loading label from server');
            }
        } catch (e) {
            showMessage('Network error while loading label');
        }
    }


    async function loadLabelsForNote(note_id) {
        try {
            const res = await fetch(`note_label.php?note_id=${note_id}`);
            const text = await res.text();  // đọc raw text trước
            try {
                const data = JSON.parse(text);
                if (data.success && Array.isArray(data.labels)) {
                    selectedLabels = new Set(data.labels.map(l => l.label_id));
                    renderLabels();
                    updateSelectedLabelsDisplay();
                } else {
                    selectedLabels.clear();
                    renderLabels();
                }
            } catch (jsonErr) {
                console.error('Could not parse JSON, response:', text);
                selectedLabels.clear();
                renderLabels();
            }
        } catch (err) {
            console.error('Error loading label for note:', err);
        }
    }

    async function saveLabelsForNote(note_id, label_ids) {
        console.log(`saveLabelsForNote called for note_id: ${note_id}`);
        try {
            const response = await fetch('note_label.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    note_id: note_id,
                    label_ids: JSON.stringify(label_ids),
                }),
            });
            const data = await response.json();
            console.log('Response from saveLabelsForNote:', data); // <-- log response JSON
            if (!data.success) {
                console.error('Error saving label:', data.error);
            }
        } catch (error) {
            console.error('Error fetch saveLabelsForNote:', error);
        }
    }

    addLabelBtn.disabled = true;
    newLabelInput.addEventListener('input', () => {
        addLabelBtn.disabled = newLabelInput.value.trim() === '';
    });

    addLabelBtn.addEventListener('click', async () => {
        const newLabel = newLabelInput.value.trim();
        if (!newLabel) return;

        const params = new URLSearchParams({
            action: 'add',
            label: newLabel
        });

        try {
            const res = await fetch('label.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Server lỗi');
        } catch (err) {
            showMessage('Thêm nhãn thất bại: ' + err.message);
            return;
        }

        // Reset input
        newLabelInput.value = '';
        addLabelBtn.disabled = true;

        await loadLabelsFromDB();
        if (typeof window.currentNoteId !== 'undefined') {
            await loadLabelsForNote(window.currentNoteId); // cập nhật selected checkbox
        }

        // Render lại giao diện
        renderLabels();
        updateSelectedLabelsDisplay();

        //Báo cho labels.js nhận
        document.dispatchEvent(new CustomEvent('labelsUpdatedExternally'));

    });


    //các hàm này có thể gọi từ home.js
    window.loadLabelsForNote = loadLabelsForNote;
    window.saveLabelsForNote = saveLabelsForNote;
    window.renderLabels = renderLabels;
    window.updateSelectedLabelsDisplay = updateSelectedLabelsDisplay;


    //load danh sách nhãn 
    loadLabelsFromDB();
});
