import fetch from 'node-fetch';

async function testAuth() {
  // Try to login
  console.log("Attempting to login with test user...");
  
  try {
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        password: 'password123'
      }),
      redirect: 'manual'
    });
    
    console.log("Login status:", loginResponse.status);
    console.log("Login headers:", loginResponse.headers);
    
    if (loginResponse.ok) {
      const userData = await loginResponse.json();
      console.log("User data:", userData);
      
      // Get the cookie
      const cookies = loginResponse.headers.get('set-cookie');
      console.log("Cookies:", cookies);
      
      // Try to get user with session
      console.log("\nTrying to get current user with session...");
      const userResponse = await fetch('http://localhost:5000/api/user', {
        method: 'GET',
        headers: {
          Cookie: cookies
        }
      });
      
      console.log("User API status:", userResponse.status);
      
      if (userResponse.ok) {
        const currentUser = await userResponse.json();
        console.log("Current user:", currentUser);
      } else {
        console.log("Failed to get current user");
      }
    } else {
      console.log("Login failed");
      const errorText = await loginResponse.text();
      console.log("Error:", errorText);
    }
  } catch (error) {
    console.error("Error during authentication test:", error);
  }
}

testAuth();