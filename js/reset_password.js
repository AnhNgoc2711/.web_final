function getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || '';
}

const resetForm = document.getElementById('resetPasswordForm');
if (resetForm) {
    resetForm.onsubmit = function (e) {
        e.preventDefault();
        let newPassword = this.querySelector('input[name="new_password"]').value;
        let confirmPassword = this.querySelector('input[name="confirm_password"]').value;
        let errorDiv = this.querySelector('.errorMessage');
        errorDiv.textContent = "";

        if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
            errorDiv.textContent = "Password confirmation does not match.";
            return;
        }
        let email = getParam('email');
        let otp = getParam('otp');
        let token = getParam('token');   // LẤY THÊM TOKEN từ URL nếu có

        let formData = new FormData();
        formData.append('action', 'reset_password');
        formData.append('new_password', newPassword);
        formData.append('confirm_password', confirmPassword);
        // Nếu có otp, gửi kèm email + otp
        if (otp) {
            formData.append('email', email);
            formData.append('otp', otp);
        }
        // Nếu có token (tức là reset qua link)
        if (token) {
            formData.append('token', token);
        }

        fetch('forgot_password.php', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    errorDiv.textContent = data.message;
                } else {
                    errorDiv.style.color = "#3ad900";
                    errorDiv.textContent = "Password reset successful! Please login.";
                    setTimeout(() => window.location.href = 'login.php', 1500);
                }
            });
    }
}
