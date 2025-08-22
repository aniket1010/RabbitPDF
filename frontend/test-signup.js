// Test script to verify the pending signup flow
const testSignup = async () => {
  const response = await fetch('http://localhost:3001/api/auth/pending-signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User',
      image: null
    })
  });
  
  const data = await response.json();
  console.log('Response status:', response.status);
  console.log('Response data:', data);
  
  if (response.ok) {
    console.log('✅ Signup successful - check server logs for email sending details');
  } else {
    console.log('❌ Signup failed:', data.error);
  }
};

testSignup().catch(console.error);
