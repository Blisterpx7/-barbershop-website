// API Configuration
const API_CONFIG = {
  // Development
  development: {
    baseURL: 'http://localhost:3000',
    apiUrl: 'http://localhost:3000/api'
  },
  // Production
  production: {
    baseURL: 'https://barbershop-website-vy8e.onrender.com', // Render deployment
    apiUrl: 'https://barbershop-website-vy8e.onrender.com/api'
  }
};

// Get current environment
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const currentEnv = isDevelopment ? 'development' : 'production';

// Export the appropriate configuration
export const apiConfig = API_CONFIG[currentEnv];

// For backward compatibility, also export the old hardcoded URL
export const legacyApiUrl = 'https://barbershop-website-vy8e.onrender.com';

// Helper function to get API URL
export const getApiUrl = (endpoint = '') => {
  return `${apiConfig.apiUrl}${endpoint}`;
};

// Helper function to get base URL
export const getBaseUrl = () => {
  return apiConfig.baseURL;
};

export default apiConfig;
