// Simple test to trigger the signup endpoint and watch logs
console.log("Testing signup with Gmail SMTP...");
console.log("Go to http://localhost:3001/sign-up and create an account");
console.log("Watch the server terminal for SMTP logs");
console.log(""); 
console.log("Expected logs with Gmail SMTP:");
console.log("✅ [Mailer] SMTP Config - Host: smtp.gmail.com, Port: 587, User: SET, Pass: SET");
console.log("✅ [Mailer] Sending email from bhusalaniket100@gmail.com to test@example.com");
console.log("✅ [Mailer] Email sent successfully: <message-id>");
console.log("");
console.log("If you see 'Authentication failed', double-check:");
console.log("1. 2FA is enabled on your Gmail account");
console.log("2. App password is correct (16 characters with spaces)");
console.log("3. SMTP_USER matches the Gmail account that generated the app password");
