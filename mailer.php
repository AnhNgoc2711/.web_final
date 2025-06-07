<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';
function send_mail($to, $subject, $body)
{
    $mail = new PHPMailer(true);
    $email = 'anhthunguyne@gmail.com';
    $password = 'dbkliaovfbnjzuiu';

    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = $email;
        $mail->Password = $password;
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        $mail->setFrom($email, 'SkyNote');
        $mail->addAddress($to);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;

        $mail->send();
        return true;
    } catch (Exception $e) {
        return $mail->ErrorInfo;
    }
}

function send_activation_email($to, $name, $token)
{
    $verifyLink = "http://localhost/.web_final/verify.php?email=" . urlencode($to) . "&token=" . $token;
    $subject = "SkyNote Registration Confirmation";
    $body = "
        Hello <strong>$name</strong>,<br><br>
        We're excited to have you join SkyNote!<br><br>
        Please click the link below to verify your account:<br>
        <a href='$verifyLink'>Verify Your Account</a><br><br>
        If you did not request this, please ignore this email.<br><br>
        Best regards!
    ";
    return send_mail($to, $subject, $body);
}


function generateToken($length = 20)
{
    return bin2hex(random_bytes($length));
}
?>