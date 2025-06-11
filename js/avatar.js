document.addEventListener('DOMContentLoaded', function () {
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const topAvatar = document.getElementById('topAvatar');

    // Hàm toggle sidebar người dùng
    function toggleSidebarUser() {
        const sidebar = document.getElementById('sidebarUser');
        if (sidebar) sidebar.classList.toggle('open');
    }

    // Gắn sự kiện click mở sidebar người dùng cho topAvatar
    if (topAvatar) {
        topAvatar.style.cursor = 'pointer';
        topAvatar.addEventListener('click', toggleSidebarUser);
    }

    // Upload avatar
    if (avatarInput) {
        avatarInput.addEventListener('change', () => {
            const file = avatarInput.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('avatar', file);

            fetch('avatar.php', {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        // Nếu bạn vẫn muốn cập nhật tạm thời ảnh ở client:
                        if (avatarPreview) avatarPreview.src = data.avatarUrl + '?t=' + new Date().getTime();
                        if (topAvatar) topAvatar.src = data.avatarUrl + '?t=' + new Date().getTime();

                        // Reload lại trang để tải lại toàn bộ dữ liệu
                        location.reload();
                    } else {
                        alert('Lỗi: ' + data.error);
                    }
                })
                .catch(() => alert('Lỗi kết nối server'));
        });
    }

    // Event delegation dự phòng nếu avatar bị render lại
    document.addEventListener('click', function (e) {
        if (e.target && e.target.id === 'topAvatar') {
            toggleSidebarUser();
        }
    });
});
