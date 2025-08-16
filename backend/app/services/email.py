import emails
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.core.config import settings
from app.utils.email import send_verification_email as resend_send_verification_email

EMAIL_TEMPLATES = {
    "zh": {
        "subject": "龙眼AI - 邮箱验证",
        "body": """<p>你好，{username}！</p>\n<p>请点击以下链接完成邮箱验证：</p>\n<p><a href=\"{url}\">{url}</a></p>\n<p>如果不是你本人操作，请忽略此邮件。</p>"""
    },
    "yue": {
        "subject": "龍眼AI - 郵箱驗證",
        "body": """<p>你好，{username}！</p>\n<p>請撳以下連結完成郵箱驗證：</p>\n<p><a href=\"{url}\">{url}</a></p>\n<p>如果唔係你本人操作，請忽略此郵件。</p>"""
    },
    "en": {
        "subject": "Longan AI - Email Verification",
        "body": """<p>Hello, {username}!</p>\n<p>Please click the link below to verify your email address:</p>\n<p><a href=\"{url}\">{url}</a></p>\n<p>If this wasn't you, please ignore this email.</p>"""
    }
}

class EmailService:
    def __init__(self):
        self.smtp_config = {
            'host': settings.SMTP_HOST,
            'port': settings.SMTP_PORT,
            'user': settings.SMTP_USERNAME,
            'password': settings.SMTP_PASSWORD,
            'tls': settings.SMTP_TLS,
            'ssl': settings.SMTP_SSL,
        }
    
    def create_verification_token(self, email: str) -> str:
        """Create email verification token"""
        payload = {
            'email': email,
            'exp': datetime.now(timezone.utc) + timedelta(hours=24),  # 24 hours expiration
            'type': 'email_verification'
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    def verify_token(self, token: str) -> Optional[str]:
        """Verify email verification token"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            if payload.get('type') == 'email_verification':
                return payload.get('email')
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
        return None
    
    def send_verification_email(self, email: str, username: str, token: str, lang: str = "zh") -> bool:
        """Send verification email (via Resend) with multilingual support"""
        try:
            verification_url = f"https://longan.ai/verify-email?token={token}"
            template = EMAIL_TEMPLATES.get(lang, EMAIL_TEMPLATES["zh"])
            subject = template["subject"]
            html_content = template["body"].format(username=username, url=verification_url)
            result = resend_send_verification_email(email, subject, html_content)
            return bool(result and result.get('id'))
        except Exception as e:
            print(f"Failed to send email via Resend: {str(e)}")
            return False
    
    def send_welcome_email(self, email: str, username: str) -> bool:
        """Send welcome email"""
        try:
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>龙眼AI - 欢迎加入</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #f2750a, #0ea5e9); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .button {{ display: inline-block; background: #f2750a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>龙眼AI</h1>
                        <p>智能粤语播客生成平台</p>
                    </div>
                    <div class="content">
                        <h2>欢迎加入，{username}！</h2>
                        <p>恭喜你成功验证邮箱！现在你可以开始使用龙眼AI嘅所有功能：</p>
                        <ul>
                            <li>🎤 生成粤语播客</li>
                            <li>🎭 选择不同嘅声音角色</li>
                            <li>📁 上传文件生成播客</li>
                            <li>💾 管理历史记录</li>
                        </ul>
                        <p style="text-align: center;">
                            <a href="http://localhost:3000" class="button">开始使用</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>让AI讲好你嘅粤语故事，让粤语传承下去</p>
                        <p>&copy; 2024 龙眼AI. 保留所有权利.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            message = emails.Message(
                subject="龙眼AI - 欢迎加入",
                html=html_content,
                mail_from=(settings.FROM_NAME, settings.FROM_EMAIL)
            )
            
            response = message.send(
                to=email,
                smtp=self.smtp_config
            )
            
            return response.status_code == 250
            
        except Exception as e:
            print(f"Failed to send welcome email: {str(e)}")
            return False 

    def send_verification_code_email(self, email: str, username: str, code: str) -> bool:
        """发送登录验证码邮件"""
        try:
            subject = f"登录验证码 - {code}"
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">你好 {username}！</h2>
                <p>你的登录验证码是：</p>
                <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">{code}</h1>
                </div>
                <p>验证码将在10分钟后过期。</p>
                <p>如果这不是你的操作，请忽略此邮件。</p>
                <hr style="margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">此邮件由龙眼AI系统自动发送，请勿回复。</p>
            </div>
            """
            
            result = resend_send_verification_email(email, subject, html_content)
            return bool(result and result.get('id'))
        except Exception as e:
            print(f"Failed to send verification code email: {str(e)}")
            return False 