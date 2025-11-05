// Тестовий скрипт для перевірки API управління продуктами
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Отримання токена адміністратора
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'pilpandr79@icloud.com',
      password: 'your_password_here' // Замініть на ваш пароль
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    return null;
  }
}

// Тест: Отримання всіх продуктів
async function testGetProducts(token) {
  console.log('\n=== TEST: Get Products ===');
  try {
    const response = await axios.get(`${API_URL}/investments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Products:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return [];
  }
}

// Тест: Створення продукту
async function testCreateProduct(token) {
  console.log('\n=== TEST: Create Product ===');
  try {
    const newProduct = {
      name: 'Тестовий продукт API',
      description: 'Створено через API тест',
      min_investment: 5000,
      expected_return: 12.5,
      duration_months: 18,
      risk_level: 'Середній',
      category: 'crypto',
      is_active: true
    };
    
    console.log('Sending:', newProduct);
    
    const response = await axios.post(
      `${API_URL}/admin/products`,
      newProduct,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Created:', response.data);
    return response.data.productId;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

// Тест: Оновлення продукту
async function testUpdateProduct(token, productId) {
  console.log('\n=== TEST: Update Product ===');
  try {
    const updatedData = {
      name: 'Оновлений тестовий продукт',
      description: 'Оновлено через API тест',
      min_investment: 7500,
      expected_return: 15.0,
      duration_months: 24,
      risk_level: 'Високий',
      category: 'venture',
      is_active: true
    };
    
    console.log('Updating product', productId);
    console.log('Sending:', updatedData);
    
    const response = await axios.put(
      `${API_URL}/admin/products/${productId}`,
      updatedData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Updated:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

// Тест: Деактивація продукту
async function testDeactivateProduct(token, productId) {
  console.log('\n=== TEST: Deactivate Product ===');
  try {
    const products = await testGetProducts(token);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      console.error('❌ Product not found');
      return false;
    }
    
    const updatedData = {
      ...product,
      is_active: false
    };
    
    delete updatedData.created_at;
    
    console.log('Deactivating product', productId);
    console.log('Sending:', updatedData);
    
    const response = await axios.put(
      `${API_URL}/admin/products/${productId}`,
      updatedData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Deactivated:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

// Запуск всіх тестів
async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  // Крок 1: Логін
  const token = await login();
  if (!token) {
    console.error('❌ Cannot continue without token');
    return;
  }
  console.log('✅ Logged in successfully');
  
  // Крок 2: Отримання продуктів
  const products = await testGetProducts(token);
  
  // Крок 3: Створення продукту
  const newProductId = await testCreateProduct(token);
  
  if (newProductId) {
    // Крок 4: Оновлення продукту
    await testUpdateProduct(token, newProductId);
    
    // Крок 5: Деактивація продукту
    await testDeactivateProduct(token, newProductId);
  }
  
  // Крок 6: Перевірка фінального стану
  console.log('\n=== Final State ===');
  await testGetProducts(token);
  
  console.log('\n✅ All tests completed!');
}

// ІНСТРУКЦІЯ:
// 1. Замініть 'your_password_here' на ваш реальний пароль
// 2. Запустіть: node backend/test-products-api.js

runTests();
