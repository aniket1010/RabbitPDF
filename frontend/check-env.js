// Check if env variables are loaded correctly
console.log("🔍 Environment Variable Check:");
console.log("SMTP_HOST:", process.env.SMTP_HOST || "NOT SET");
console.log("SMTP_PORT:", process.env.SMTP_PORT || "NOT SET");
console.log("SMTP_USER:", process.env.SMTP_USER || "NOT SET");
console.log("SMTP_PASS:", process.env.SMTP_PASS ? `SET (${process.env.SMTP_PASS.length} chars)` : "NOT SET");
console.log("MAIL_FROM:", process.env.MAIL_FROM || "NOT SET");
console.log("");
console.log("Expected values:");
console.log("✅ SMTP_HOST: smtp.gmail.com");
console.log("✅ SMTP_PORT: 587");
console.log("✅ SMTP_USER: bhusalaniket100@gmail.com");
console.log("✅ SMTP_PASS: 16 characters (no spaces)");
console.log("✅ MAIL_FROM: bhusalaniket100@gmail.com");
