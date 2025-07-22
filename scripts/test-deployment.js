#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration de déploiement
 * Usage: node scripts/test-deployment.js [URL_API]
 */

const https = require('https');
const http = require('http');

// Configuration
const DEFAULT_API_URL = 'http://localhost:3000';
const API_URL = process.argv[2] || DEFAULT_API_URL;

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 10000
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testEndpoint(endpoint, expectedStatus, description, options = {}) {
  try {
    log(`\n🔍 Test: ${description}`, 'blue');
    log(`   URL: ${API_URL}${endpoint}`, 'yellow');
    
    const response = await makeRequest(`${API_URL}${endpoint}`, options);
    
    if (response.status === expectedStatus) {
      log(`   ✅ Succès: ${response.status}`, 'green');
      if (response.data && response.data.message) {
        log(`   📝 Message: ${response.data.message}`, 'green');
      }
    } else {
      log(`   ❌ Échec: ${response.status} (attendu: ${expectedStatus})`, 'red');
      if (response.data && response.data.message) {
        log(`   📝 Message: ${response.data.message}`, 'red');
      }
    }
    
    return response.status === expectedStatus;
  } catch (error) {
    log(`   ❌ Erreur: ${error.message}`, 'red');
    return false;
  }
}

async function testCORS() {
  log(`\n🌐 Test CORS`, 'blue');
  
  try {
    const response = await makeRequest(`${API_URL}/api/produits`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://test-frontend.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization'
      }
    });
    
    const corsHeaders = response.headers;
    const hasCorsHeaders = corsHeaders['access-control-allow-origin'] || 
                          corsHeaders['Access-Control-Allow-Origin'];
    
    if (hasCorsHeaders) {
      log(`   ✅ Headers CORS présents`, 'green');
      log(`   📝 Origin: ${corsHeaders['access-control-allow-origin'] || corsHeaders['Access-Control-Allow-Origin']}`, 'green');
    } else {
      log(`   ❌ Headers CORS manquants`, 'red');
    }
    
    return hasCorsHeaders;
  } catch (error) {
    log(`   ❌ Erreur CORS: ${error.message}`, 'red');
    return false;
  }
}

async function testSwagger() {
  log(`\n📚 Test Swagger`, 'blue');
  
  try {
    const response = await makeRequest(`${API_URL}/api-docs`);
    
    if (response.status === 200) {
      log(`   ✅ Swagger accessible`, 'green');
      
      // Vérifier si la page contient des éléments Swagger
      const html = response.data;
      if (typeof html === 'string' && html.includes('swagger-ui')) {
        log(`   ✅ Interface Swagger détectée`, 'green');
        return true;
      } else {
        log(`   ⚠️  Interface Swagger non détectée`, 'yellow');
        return false;
      }
    } else {
      log(`   ❌ Swagger inaccessible: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`   ❌ Erreur Swagger: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log(`${colors.bold}🚀 Test de déploiement pour: ${API_URL}${colors.reset}`, 'blue');
  
  const results = {
    cors: false,
    swagger: false,
    auth: {
      noToken: false,
      invalidToken: false,
      validToken: false
    }
  };
  
  // Test CORS
  results.cors = await testCORS();
  
  // Test Swagger
  results.swagger = await testSwagger();
  
  // Tests d'authentification
  results.auth.noToken = await testEndpoint(
    '/api/produits',
    401,
    'Accès sans token (doit retourner 401)'
  );
  
  results.auth.invalidToken = await testEndpoint(
    '/api/produits',
    401,
    'Accès avec token invalide (doit retourner 401)',
    {
      headers: {
        'Authorization': 'Bearer token_invalide'
      }
    }
  );
  
  // Test avec token valide (optionnel)
  if (process.env.TEST_TOKEN) {
    results.auth.validToken = await testEndpoint(
      '/api/produits',
      200,
      'Accès avec token valide (doit retourner 200)',
      {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_TOKEN}`
        }
      }
    );
  }
  
  // Résumé
  log(`\n${colors.bold}📊 Résumé des tests${colors.reset}`, 'blue');
  log(`   CORS: ${results.cors ? '✅' : '❌'}`, results.cors ? 'green' : 'red');
  log(`   Swagger: ${results.swagger ? '✅' : '❌'}`, results.swagger ? 'green' : 'red');
  log(`   Auth sans token: ${results.auth.noToken ? '✅' : '❌'}`, results.auth.noToken ? 'green' : 'red');
  log(`   Auth token invalide: ${results.auth.invalidToken ? '✅' : '❌'}`, results.auth.invalidToken ? 'green' : 'red');
  
  if (process.env.TEST_TOKEN) {
    log(`   Auth token valide: ${results.auth.validToken ? '✅' : '❌'}`, results.auth.validToken ? 'green' : 'red');
  }
  
  const allTestsPassed = results.cors && results.swagger && results.auth.noToken && results.auth.invalidToken;
  
  if (allTestsPassed) {
    log(`\n🎉 Tous les tests sont passés !`, 'green');
    log(`   Les erreurs d'authentification s'affichent correctement.`, 'green');
  } else {
    log(`\n⚠️  Certains tests ont échoué.`, 'yellow');
    log(`   Vérifiez la configuration de déploiement.`, 'yellow');
  }
  
  return allTestsPassed;
}

// Exécution du script
if (require.main === module) {
  runTests().catch(error => {
    log(`\n💥 Erreur fatale: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint, testCORS, testSwagger }; 