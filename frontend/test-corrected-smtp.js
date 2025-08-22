// Test the corrected Gmail SMTP setup
const testCorrectSMTP = async () => {
  console.log("🧪 Testing corrected Gmail SMTP setup...");
  console.log("Password format fixed: removed spaces");
  console.log("");
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/pending-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test.smtp@example.com', // Use test email
        password: 'testpassword123',
        name: 'SMTP Test User',
        image: null
      })
    });
    
    const data = await response.json();
    console.log('✅ Response status:', response.status);
    console.log('📝 Response data:', data);
    
    if (response.ok) {
      console.log('\n🎉 SUCCESS! Check the server terminal for email logs:');
      console.log('Expected to see:');
      console.log('✅ [Mailer] SMTP Config - Host: smtp.gmail.com...');
      console.log('✅ [Mailer] Email sent successfully: <message-id>');
    } else {
      console.log('\n❌ FAILED:', data.error);
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

// Wait for server to be ready, then test
setTimeout(testCorrectSMTP, 2000);
