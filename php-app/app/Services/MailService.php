<?php
namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;
use Core\Config;

class MailService
{
    public static function send(string $toEmail, string $toName, string $subject, string $htmlBody): bool
    {
        $mail = new PHPMailer(true);
        try {
            $host = Config::get('mail.host');
            if ($host) {
                $mail->isSMTP();
                $mail->Host = $host;
                $mail->Port = (int)Config::get('mail.port', 587);
                $mail->SMTPAuth = true;
                $mail->Username = (string)Config::get('mail.username');
                $mail->Password = (string)Config::get('mail.password');
                $enc = (string)Config::get('mail.encryption', 'tls');
                if ($enc === 'ssl') { $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; }
                elseif ($enc === 'tls') { $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; }
            }
            $fromEmail = (string)Config::get('mail.from_email', 'no-reply@localhost');
            $fromName = (string)Config::get('mail.from_name', 'MartMarket');
            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($toEmail, $toName ?: $toEmail);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = strip_tags($htmlBody);
            return $mail->send();
        } catch (MailException $e) {
            return false;
        }
    }
}
