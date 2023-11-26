function getVerificationEmailString(user, verificationLink) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NUSTUTOR - Email Verification</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                text-align: center;
            }
    
            .container {
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
    
            h2 {
                color: #3498db;
            }
    
            p {
                color: #666666;
                line-height: 1.6;
            }
    
            .verification-link {
                display: inline-block;
                margin: 20px 0;
                padding: 12px 24px;
                background-color: #3498db;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>NUSTUTOR Email Verification</h2>
            <p>Hi <%= user %>,</p>
            <p>Thank you for signing up with NUSTUTOR. To complete your registration, please click the link below to verify your email:</p>
            <a class="verification-link" href="<%= verificationLink %>">Verify Your Email</a>
            <p>If you did not sign up for NUSTUTOR, please disregard this email.</p>
            <p>Best regards,<br>NUSTUTOR Team.</p>
        </div>
    </body>
    </html>
`};

module.exports = getVerificationEmailString;