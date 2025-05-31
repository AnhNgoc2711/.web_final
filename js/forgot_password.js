// Khi submit form quên mật khẩu lần đầu
document.getElementById('ForgetPassword').addEventListener('submit', function (e) {
    e.preventDefault();
    let form = this;
    let emailInput = form.querySelector('input[name="email"]');
    let checkedRadio = form.querySelector('input[name="method"]:checked');
    let method = checkedRadio ? checkedRadio.value : null;
    let errorDiv = form.querySelector('.errorMessageForgetPassword');


    errorDiv.textContent = " ";
    emailInput.classList.remove('input-error');
    let formData = new FormData(form);

    fetch('forgot_password.php', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                errorDiv.textContent = data.message;
                emailInput.value = "";
                emailInput.classList.add('input-error');
                emailInput.focus();
            } else {
                errorDiv.textContent = "";
                emailInput.classList.remove('input-error');
                if (data.method === 'otp') {
                    renderOtpOnlySection(form, data.message, emailInput.value);
                } else if (data.method === 'link') {
                    form.innerHTML = `
                  <div class="errorMessageForgetPassword" style="color:#fbbc04;text-align:center;">
                    ${data.message || ""}
                  </div>
                  <div class="create-account">
                    <a onclick="showTab('loginForm', event)">< Back to Login</a>
                </div>
                `;
                }
            }
        });
});

function renderOtpOnlySection(form, message, email) {
    form.innerHTML = `
        <div class="errorMessageOTP" style="color:#fbbc04;text-align:center;margin-bottom:0.8em;">
          ${message || "OTP has been sent to your email. Please check and enter it below."}
        </div>
        <div class="otp-input-group" style="margin-bottom:1.4em;">
            <input type="text" name="otp1" maxlength="1" required pattern="\\d*">
            <input type="text" name="otp2" maxlength="1" required pattern="\\d*">
            <input type="text" name="otp3" maxlength="1" required pattern="\\d*">
            <input type="text" name="otp4" maxlength="1" required pattern="\\d*">
            <input type="text" name="otp5" maxlength="1" required pattern="\\d*">
            <input type="text" name="otp6" maxlength="1" required pattern="\\d*">
        </div>
        <div class="errorMessageOTP" style="min-height:1.2em;"></div>
        <button type="submit" class="tab-btn">Verify OTP</button>
        <div class="create-account">
            <a onclick="showTab('loginForm', event)">
              < Back to Login</a>
          </div>
        <input type="hidden" name="email" value="${email}"/>
    `;
    setupOtpAutoFocus();

    form.onsubmit = function (e) {
        e.preventDefault();
        let otp = getOtpValue();
        let errorDivs = form.querySelectorAll('.errorMessageOTP');
        let errorDiv = errorDivs[errorDivs.length - 1];
        if (!errorDiv) {
            alert("Error field not found in form! Check HTML structure.");
            return;
        }
        errorDiv.textContent = "";

        if (otp.length !== 6) {
            errorDiv.textContent = "Please enter the 6-digit OTP code.";
            return;
        }
        let formData = new FormData();
        formData.append('action', 'verify_otp');
        formData.append('otp', otp);
        formData.append('email', email);

        fetch('forgot_password.php', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    errorDiv.textContent = data.message || "OTP code is incorrect.";
                    form.querySelectorAll('.otp-input-group input[type="text"]').forEach(input => input.value = '');
                    form.querySelector('.otp-input-group input[type="text"]').focus();
                } else {
                    window.location.href = `reset_password.html?email=${encodeURIComponent(email)}&otp=${otp}`;
                }
            });
    };
}



// SAU KHI ĐÚNG OTP, mới hiện nhập mật khẩu mới
function renderPasswordSection(form, email, otp) {
    form.innerHTML = `
        <div class="errorMessageOTP" style="color:#fbbc04;text-align:center;margin-bottom:0.8em;">
          Please enter your new password.
        </div>
        <input type="password" name="new_password" placeholder="New password" required>
        <input type="password" name="confirm_password" placeholder="Confirm new password" required>
        <div class="errorMessageOTP" style="min-height:1.2em;"></div>
        <button type="submit" class="tab-btn">Reset Password</button>
        <div class="create-account">
            <a onclick="showTab('loginForm', event)">
              < Back to Login</a>
          </div>
        <input type="hidden" name="email" value="${email}"/>
        <input type="hidden" name="otp" value="${otp}"/>
    `;

    form.onsubmit = function (e) {
        e.preventDefault();
        let newPassword = form.querySelector('input[name="new_password"]').value;
        let confirmPassword = form.querySelector('input[name="confirm_password"]').value;
        let errorDiv = form.querySelector('.errorMessageOTP');
        let email = form.querySelector('input[name="email"]').value;
        let otp = form.querySelector('input[name="otp"]').value;
        errorDiv.textContent = "";

        if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
            errorDiv.textContent = "Password confirmation does not match.";
            return;
        }
        let formData = new FormData();
        formData.append('action', 'reset_password');
        formData.append('new_password', newPassword);
        formData.append('confirm_password', confirmPassword);
        formData.append('email', email);
        formData.append('otp', otp);

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
                    setTimeout(() => showTab('loginForm'), 1500);
                }
            });
    };
}


function setupOtpAutoFocus() {
    const otpInputs = document.querySelectorAll('.otp-input-group input[type="text"]');
    otpInputs.forEach((input, idx) => {
        input.addEventListener('input', function (e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value && idx < otpInputs.length - 1) {
                otpInputs[idx + 1].focus();
            }
        });
        input.addEventListener('keydown', function (e) {
            if (e.key === "Backspace" && !this.value && idx > 0) {
                otpInputs[idx - 1].focus();
            }
        });
        input.addEventListener('focus', function () {
            this.select();
        });
    });
}
function getOtpValue() {
    let otp = '';
    document.querySelectorAll('.otp-input-group input[type="text"]').forEach(input => {
        otp += input.value;
    });
    return otp;
}
