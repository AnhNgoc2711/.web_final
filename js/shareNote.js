document.getElementById("shareBtn").addEventListener("click", () => {
  document.getElementById("shareModal").classList.remove("hidden");
  renderUsers();
});

function closeModal() {
  document.getElementById("shareModal").classList.add("hidden");
}
const users = [
  { email: "you@example.com", role: "Owner", isOwner: true },
  { email: "editor@example.com", role: "Can edit", isOwner: false }
];

function renderUsers() {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";
  users.forEach((user, index) => {
    tbody.innerHTML += `
        <tr>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>
            ${user.isOwner ? `<i class="bi bi-lock" title="Owner"></i>` : `
              <i class="bi bi-pencil" onclick="editUser(${index})" title="Edit permission"></i>
              &nbsp;
              <i class="bi bi-trash" onclick="deleteUser(${index})" title="Remove user"></i>
            `}
          </td>
        </tr>
      `;
  });
}
document.getElementById("saveShareSettingsBtn").addEventListener("click", saveShareSettings);
