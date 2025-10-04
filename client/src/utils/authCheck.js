// Utility to check authentication status
export const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No token found in localStorage');
    return false;
  }
  
  try {
    // Decode JWT token to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    console.log('🔍 Token info:', {
      userId: payload.userId,
      issuedAt: new Date(payload.iat * 1000).toLocaleString(),
      expiresAt: new Date(payload.exp * 1000).toLocaleString(),
      isExpired: payload.exp < currentTime
    });
    
    if (payload.exp < currentTime) {
      console.log('❌ Token is expired');
      localStorage.removeItem('token');
      return false;
    }
    
    console.log('✅ Token is valid');
    return true;
  } catch (error) {
    console.log('❌ Invalid token format:', error);
    localStorage.removeItem('token');
    return false;
  }
};

// Test API call with current token
export const testAPICall = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No token available for API test');
    return;
  }
  
  try {
    console.log('🧪 Testing API call with current token...');
    
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful:', data);
      return data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ API call failed:', response.status, errorData);
      return null;
    }
  } catch (error) {
    console.log('❌ API call error:', error);
    return null;
  }
};

// Run both checks
export const runAuthDiagnostics = async () => {
  console.log('🔍 Running authentication diagnostics...');
  
  const isTokenValid = checkAuthStatus();
  if (isTokenValid) {
    await testAPICall();
  }
  
  return isTokenValid;
};
