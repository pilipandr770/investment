// API Configuration
// В production (на Render) backend и frontend на одном домене

// Определяем production по hostname (если не localhost - значит production)
const isProduction = !window.location.hostname.includes('localhost') && 
                     !window.location.hostname.includes('127.0.0.1');

const API_URL = isProduction
  ? '/api' // Относительный путь в production (тот же домен)
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

const BACKEND_URL = isProduction
  ? '' // Тот же домен в production
  : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');

console.log('🔧 API Configuration:', {
  hostname: window.location.hostname,
  isProduction,
  API_URL,
  BACKEND_URL
});

export { API_URL, BACKEND_URL };
export default API_URL;
