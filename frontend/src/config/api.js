// API Configuration
// В production (на Render) backend и frontend на одном домене
const isDevelopment = process.env.NODE_ENV === 'development';

const API_URL = isDevelopment 
  ? (process.env.REACT_APP_API_URL || 'http://localhost:5000/api')
  : '/api'; // Относительный путь в production

const BACKEND_URL = isDevelopment
  ? (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000')
  : ''; // Тот же домен в production

export { API_URL, BACKEND_URL };
export default API_URL;
