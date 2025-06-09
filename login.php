<?php
session_start();
require 'db.php';

$errorMsg = '';

$registerError = '';
if (isset($_SESSION['register_error'])) {
  $registerError = $_SESSION['register_error'];
  unset($_SESSION['register_error']);
}

// Nếu là POST thì xử lý đăng nhập
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $email = $_POST['email'] ?? '';
  $password = $_POST['password'] ?? '';

  if (empty($email) || empty($password)) {
    $errorMsg = 'Please enter both email and password.';
  } else {
    $stmt = $pdo->prepare("SELECT user_id, email, name, password, is_active FROM `USER` WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
      $errorMsg = 'Email does not exist.';
    } else {
      if (!password_verify($password, $user['password'])) {
        $errorMsg = 'Incorrect password.';
      } else {
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['name'] = $user['name'];
        $_SESSION['is_active'] = $user['is_active'];

        header("Location: home.php");
        exit;
      }
    }
  }
}
?>
<!DOCTYPE html>
<html lang="vi">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SkyNote Website</title>
  <link rel="icon" href="image/icon.png" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" />
  <link rel="stylesheet" href="css/login.css" />
</head>

<body>
  <div class="container">
    <div class="home-left">
      <img src="image/nen.jpg" alt="Hình 1" class="active" loading="lazy" />
    </div>

    <div class="home-right">
      <div class="home-right-center">
        <h1><i class="bi bi-cloudy"></i> SkyNote</h1>
        <p>Welcome to SkyNote - a smart, smooth and convenient note-taking application. Register or log in to start
          experiencing it now!</p>
        <form id="loginForm" action="login.php" method="POST" novalidate class="active">
          <div class="errorMessageLogin" style="color: red; font-weight: bold; margin-bottom: 10px;">
            <?php
            if ($errorMsg) {
              echo htmlspecialchars($errorMsg);
            }
            ?>
          </div>
          <input name="email" type="email" placeholder="Email" required
            value="<?php echo isset($email) ? htmlspecialchars($email) : ''; ?>" />
          <div class="password-container">
            <input name="password" type="password" placeholder="Password" required />
            <i class="bi bi-eye-slash toggle-password"></i>
          </div>
          <div class="forgot-password">
            <a onclick="showTab('ForgetPassword', event)">Forgot your password? </a>
          </div>
          <button type="submit" class="tab-btn ">Login</button>
          <div class="create-account">
            Don't have an account? <a href="#" onclick="showTab('registerForm', event)">Sign up.</a>
          </div>
        </form>

        <form id="registerForm" action="register.php" method="POST" novalidate>
          <div class="errorMessageRegister" style="color: red; font-weight: bold; margin-bottom: 10px;">
            <?php
            if ($registerError) {
              echo htmlspecialchars($registerError);
            }
            ?>
          </div>
          <input name="email" type="email" placeholder="Email" required />
          <input name="name" type="text" placeholder="Full name" required />
          <div class="password-container">
            <input name="password" type="password" placeholder="Password" required />
            <i class="bi bi-eye-slash toggle-password"></i>
          </div>
          <div class="password-container">
            <input name="confirm" type="password" placeholder="Re-enter the password" required />
            <i class="bi bi-eye-slash toggle-password"></i>
          </div>
          <button type="submit" class="tab-btn ">Sign up</button>
          <div class="create-account">
            Already have an account? <a onclick="showTab('loginForm', event)">Login.</a>
          </div>
        </form>
        <form id="ForgetPassword" action="#" method="POST" novalidate>
          <div class="errorMessageForgetPassword"></div>
          <input name="email" type="email" placeholder="Email" required />
          <div class="method-group">
            <label>
              <input type="radio" name="method" value="otp" required>
              Verify by OTP sent to email
            </label>
            <label>
              <input type="radio" name="method" value="link" checked>
              Verify by reset link sent to email
            </label>
          </div>
          <button type="submit" class="tab-btn ">Retrieve Password</button>
          <div class="create-account">
            <a onclick="showTab('loginForm', event)">
              < Back to Login</a>
          </div>
        </form>
      </div>
    </div>
  </div>

  <script src="js/login.js"></script>
  <script src="js/forgot_password.js"></script>

</body>

</html>