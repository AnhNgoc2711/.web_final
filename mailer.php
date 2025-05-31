<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';
function send_mail($to, $subject, $body)
{
    $mail = new PHPMailer(true);

    $email = 'ngoccphamm2711@gmail.com';
    $password = 'alhwfvzpmldomdtg';

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

function generateToken($length = 20)
{
    return bin2hex(random_bytes($length));
}
?>
