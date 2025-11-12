// Backend API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? '/auth'
  : 'https://rektnow.wtf/auth';

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    username: string;
    createdAt: string;
    lastLogin?: string;
  };
}

// Register new user
export const registerUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      message: 'Network error - unable to register',
    };
  }
};

// Login user
export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network error - unable to login',
    };
  }
};

// Get all users (for debugging)
export const getAllUsers = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/list`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get users error:', error);
    return {
      success: false,
      message: 'Network error',
    };
  }
};

// Verify session
export const verifySession = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Verify session error:', error);
    return {
      success: false,
      message: 'Network error',
    };
  }
};
