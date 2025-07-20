import emails
import jwt
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings

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
            'exp': datetime.utcnow() + timedelta(hours=24),  # 24 hours expiration
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
    
    def send_verification_email(self, email: str, username: str, token: str) -> bool:
        """Send verification email"""
        try:
            # Verification link
            verification_url = f"http://localhost:3000/verify-email?token={token}"
            
            # Email content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>龙眼AI - 邮箱验证</title>
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
                        <h2>你好，{username}！</h2>
                        <p>欢迎加入龙眼AI！请点击下面嘅按钮验证你嘅邮箱地址：</p>
                        <p style="text-align: center;">
                            <a href="{verification_url}" class="button">验证邮箱</a>
                        </p>
                        <p>如果你冇注册龙眼AI，请忽略呢封邮件。</p>
                        <p>验证链接会在24小时后过期。</p>
                    </div>
                    <div class="footer">
                        <p>让AI讲好你嘅粤语故事</p>
                        <p>&copy; 2024 龙眼AI. 保留所有权利.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text content
            text_content = f"""
            你好，{username}！
            
            欢迎加入龙眼AI！请点击下面嘅链接验证你嘅邮箱地址：
            
            {verification_url}
            
            如果你冇注册龙眼AI，请忽略呢封邮件。
            验证链接会在24小时后过期。
            
            让AI讲好你嘅粤语故事
            © 2024 龙眼AI. 保留所有权利.
            """
            
            # Send email
            message = emails.Message(
                subject="龙眼AI - 邮箱验证",
                html=html_content,
                text=text_content,
                mail_from=(settings.FROM_NAME, settings.FROM_EMAIL)
            )
            
            response = message.send(
                to=email,
                smtp=self.smtp_config
            )
            
            return response.status_code == 250
            
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
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
                        <p>让AI讲好你嘅粤语故事</p>
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