# Email Setup Guide

## Gmail SMTP Configuration

This guide will help you configure Gmail SMTP for sending verification emails.

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password

1. Go to Google Account settings
2. Navigate to Security
3. Under "2-Step Verification", click on "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Enter "Longan AI" as the name
6. Click "Generate"
7. Copy the 16-character password

### Step 3: Update Environment Variables

Update your `.env` file with the following settings:

```env
# Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_TLS=true
SMTP_SSL=false
FROM_EMAIL=noreply@longan.ai
FROM_NAME=龍眼AI
```

### Step 4: Test Email Configuration

You can test the email configuration by running:

```bash
cd backend
python -c "
from app.services.email import EmailService
email_service = EmailService()
result = email_service.send_verification_email('test@example.com', 'TestUser', 'test-token')
print('Email sent successfully' if result else 'Failed to send email')
"
```

## Alternative Email Providers

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_TLS=true
SMTP_SSL=false
```

### Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_TLS=true
SMTP_SSL=false
```

### Custom SMTP Server

```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
SMTP_TLS=true
SMTP_SSL=false
```

## Troubleshooting

### Common Issues

1. **Authentication failed**: Make sure you're using an App Password, not your regular Gmail password
2. **Connection timeout**: Check your firewall settings and ensure port 587 is open
3. **SSL/TLS errors**: Try setting `SMTP_SSL=false` and `SMTP_TLS=true`

### Debug Mode

To enable debug mode for email sending, add this to your `.env`:

```env
DEBUG=true
```

This will print detailed SMTP communication logs.

## Security Notes

- Never commit your `.env` file to version control
- Use App Passwords instead of your main account password
- Regularly rotate your App Passwords
- Consider using environment variables in production 