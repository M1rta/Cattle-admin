import os
import smtplib
from email.message import EmailMessage


def send_welcome_email(to_email, nombre):
    sender_email = os.getenv("MAIL_USER")
    sender_password = os.getenv("MAIL_PASSWORD")

    if not sender_email or not sender_password:
        raise ValueError("Faltan MAIL_USER o MAIL_PASSWORD")

    msg = EmailMessage()
    msg["Subject"] = "Cuenta creada correctamente"
    msg["From"] =  f"GestordeGanado <{sender_email}>"
    msg["To"] = to_email

    msg.set_content(f"""
Hola {nombre},

Tu cuenta fue creada correctamente en Gestor de Ganado.

Ya puedes iniciar sesión en el sistema.

Saludos.

Equipo de soporte a usuario Gestor de Ganado.
""")

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls()
        smtp.login(sender_email, sender_password)
        smtp.send_message(msg)