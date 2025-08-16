import resend
from app.core.config import settings

def send_verification_email(to_email: str, subject: str, html_content: str):
    try:
        print(f"DEBUG: Sending email to {to_email}")
        print(f"DEBUG: Using API key: {settings.RESEND_API_KEY[:10]}..." if settings.RESEND_API_KEY else "DEBUG: No API key")
        print(f"DEBUG: From: {settings.RESEND_FROM}")
        
        resend.api_key = settings.RESEND_API_KEY
        params = {
            "from": settings.RESEND_FROM,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        
        print(f"DEBUG: Resend params: {params}")
        result = resend.Emails.send(params)
        print(f"DEBUG: Resend result: {result}")
        return result
    except Exception as e:
        print(f"DEBUG: Resend error: {str(e)}")
        raise e 