(() => {
  let notes = [];
  let labels = [];
  let selectedFilterLabelId = null;

const filterLabelListEl = document.getElementById('labellist');

function renderFilteredNotes() {
  const selectedLabelsDiv = document.getElementById('selected-labels');
  selectedLabelsDiv.innerHTML = '';

  if (notes.length === 0) {
    selectedLabelsDiv.innerHTML = '<p>Không có ghi chú nào.</p>';
    return;
  }

  notes.forEach(note => {
    const noteEl = document.createElement('div');
    noteEl.className = 'note';
    noteEl.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
    `;
    selectedLabelsDiv.appendChild(noteEl);
  });
}

async function loadLabelsFromDB() {
  try {
    const res = await fetch('label.php'); // PHP trả về danh sách labels
    const data = await res.json();

    if (data.success) {
      labels = data.labels;
      console.log("Labels loaded:", labels);
    } else {
      console.error(data.message || 'Không thể tải danh sách nhãn');
    }
  } catch (error) {
    console.error('Lỗi tải labels:', error);
  }
}

async function loadNotesByLabel(label_id = null) {
  console.log("Gọi API với label_id:", label_id);

  try {
    let url = 'get_note_labels.php';
    if (label_id !== null) url += '?label_id=' + encodeURIComponent(label_id);

    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      console.log('Danh sách note_id trả về:', data.notes.map(n => n.note_id));
      notes = data.notes.map(note => ({
        ...note,
        labels: note.labels || []
      }));
      renderFilteredNotes();
    } else {
      showMessage(data.message || 'Lỗi tải ghi chú');
    }
  } catch (e) {
    console.error('Fetch error:', e);
    showMessage('Lỗi mạng khi tải ghi chú');
  }
}

function renderFilterLabels() {
  filterLabelListEl.innerHTML = '';
  console.log("labels hiện tại:", labels);

  const allLi = document.createElement('li');
  allLi.textContent = 'Tất cả ghi chú';
  allLi.style.cursor = 'pointer';
  allLi.style.fontWeight = selectedFilterLabelId === null ? 'bold' : 'normal';
  allLi.onclick = () => {
    selectedFilterLabelId = null;
    renderFilterLabels();
    loadNotesByLabel(null);
  };
  filterLabelListEl.appendChild(allLi);

  labels.forEach(label => {
    const li = document.createElement('li');
    li.textContent = label.name_label;
    li.style.cursor = 'pointer';
    li.style.fontWeight = selectedFilterLabelId === label.label_id ? 'bold' : 'normal';
    li.onclick = () => {
      selectedFilterLabelId = label.label_id;
      console.log('Đã chọn label_id:', selectedFilterLabelId);
      renderFilterLabels();
      loadNotesByLabel(label.label_id);
    };
    filterLabelListEl.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadLabelsFromDB().then(() => {
    renderFilterLabels();
    loadNotesByLabel(null);
  });
});
})();