<<<<<<< HEAD
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Función para hacer pruebas
async function testEndpoint(endpoint, method = 'get', data = null) {
=======
﻿const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

// Función para hacer pruebas
async function testEndpoint(endpoint, method = "get", data = null) {
>>>>>>> origin
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
<<<<<<< HEAD
      headers: { 'Content-Type': 'application/json' }
=======
      headers: { "Content-Type": "application/json" }
>>>>>>> origin
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${method.toUpperCase()} ${endpoint}:`, response.status, response.data);
  } catch (error) {
    if (error.response) {
      console.log(`❌ ${method.toUpperCase()} ${endpoint}:`, error.response.status, error.response.data);
    } else {
      console.log(`❌ ${method.toUpperCase()} ${endpoint}:`, error.message);
    }
  }
}

// Pruebas de seguridad
async function runSecurityTests() {
<<<<<<< HEAD
  console.log('🧪 Iniciando pruebas de seguridad...\n');
  
  // 1. Test de rate limiting (hacer muchas peticiones)
  console.log('1. Probando rate limiting...');
  for (let i = 0; i < 6; i++) {
    await testEndpoint('/products');
=======
  console.log("🧪 Iniciando pruebas de seguridad...\n");
  
  // 1. Test de rate limiting (hacer muchas peticiones)
  console.log("1. Probando rate limiting...");
  for (let i = 0; i < 6; i++) {
    await testEndpoint("/products");
>>>>>>> origin
    await new Promise(resolve => setTimeout(resolve, 100)); // Pequeña pausa
  }
  
  // Pequeña pausa entre pruebas
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 2. Test de validación de productos
<<<<<<< HEAD
  console.log('\n2. Probando validación de productos...');
  
  // Producto con datos inválidos
  await testEndpoint('/products', 'post', {
    name: '<script>alert("xss")</script>', // XSS attempt
    price: -10, // Precio negativo
    stock: 'no-es-numero' // Stock no numérico
  });
  
  // Producto con datos válidos
  await testEndpoint('/products', 'post', {
    name: 'Producto de prueba',
    price: 100,
    stock: 50,
    category: 'Test',
    description: 'Descripción segura'
  });
  
  // 3. Test de ID inválido
  console.log('\n3. Probando validación de ID...');
  await testEndpoint('/products/<script>', 'get'); // ID con caracteres peligrosos
  await testEndpoint('/products/123', 'get'); // ID válido (si existe)
  
  console.log('\n🎉 Pruebas completadas. Revisa los resultados arriba.');
=======
  console.log("\n2. Probando validación de productos...");
  
  // Producto con datos inválidos
  await testEndpoint("/products", "post", {
    name: '<script>alert("xss")</script>', // XSS attempt
    price: -10, // Precio negativo
    stock: "no-es-numero" // Stock no numérico
  });
  
  // Producto con datos válidos
  await testEndpoint("/products", "post", {
    name: "Producto de prueba",
    price: 100,
    stock: 50,
    category: "Test",
    description: "Descripción segura"
  });
  
  // 3. Test de ID inválido
  console.log("\n3. Probando validación de ID...");
  await testEndpoint("/products/<script>", "get"); // ID con caracteres peligrosos
  await testEndpoint("/products/123", "get"); // ID válido (si existe)
  
  console.log("\n🎉 Pruebas completadas. Revisa los resultados arriba.");
>>>>>>> origin
}

// Ejecutar pruebas si el archivo se ejecuta directamente
if (require.main === module) {
<<<<<<< HEAD
  console.log('🔍 Esperando 2 segundos para que el servidor esté listo...');
=======
  console.log("🔍 Esperando 2 segundos para que el servidor esté listo...");
>>>>>>> origin
  
  // Esperar a que el servidor esté listo
  setTimeout(() => {
    runSecurityTests();
  }, 2000);
}

<<<<<<< HEAD
module.exports = { testEndpoint, runSecurityTests };
=======
module.exports = { testEndpoint, runSecurityTests };
>>>>>>> origin
