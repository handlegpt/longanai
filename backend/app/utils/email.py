import resend
from app.core.config import settings

def send_verification_email(to_email: str, subject: str, html_content: str):
    resend.api_key = settings.RESEND_API_KEY
    params = {
        "from": settings.RESEND_FROM,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }
    return resend.Emails.send(params) 