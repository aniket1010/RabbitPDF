// Quick test script for Gmail SMTP
const testGmailSMTP = async () => {
  try {
    console.log('Testing Gmail SMTP configuration...');
    
    const response = await fetch('http://localhost:3001/api/auth/pending-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test.verification@gmail.com', // Use a different test email
        password: 'testpassword123',
        name: 'Test User',
        image: null
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Signup successful - check server logs and your Gmail sent folder');
      console.log('📧 Verification email should be sent to test.verification@gmail.com');
    } else {
      console.log('❌ Signup failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Wait a bit then test
setTimeout(testGmailSMTP, 2000);
