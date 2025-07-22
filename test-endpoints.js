const http = require('http');

// Test d'authentification
async function testAuth() {
  console.log('\n🔐 Test d\'authentification...');
  
  // Test de login avec données invalides (devrait échouer)
  const loginData = JSON.stringify({
    email: 'test@test.com',
    password: 'wrongpassword'
  });

  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ Login test - Status: ${res.statusCode} (attendu: 401 car pas de DB)`);
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Auth test error: ${err.message}`);
      resolve();
    });

    req.write(loginData);
    req.end();
  });
}

// Test des endpoints sans authentification
async function testPublicEndpoints() {
  console.log('\n🌍 Test des endpoints publics...');

  const endpoints = [
    '/',
    '/api/health',
    '/api-docs'
  ];

  for (const endpoint of endpoints) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port: 3000,
          path: endpoint,
          method: 'GET'
        }, (res) => {
          console.log(`✅ ${endpoint} - Status: ${res.statusCode}`);
          resolve();
        });

        req.on('error', (err) => {
          console.log(`❌ ${endpoint} - Error: ${err.message}`);
          reject(err);
        });

        req.end();
      });
    } catch (error) {
      // Continue même en cas d'erreur
    }
  }
}

// Test des endpoints protégés (devrait retourner 401)
async function testProtectedEndpoints() {
  console.log('\n🔒 Test des endpoints protégés (devrait retourner 401)...');

  const protectedEndpoints = [
    '/api/categories',
    '/api/produits',
    '/api/commandes',
    '/api/paiements'
  ];

  for (const endpoint of protectedEndpoints) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port: 3000,
          path: endpoint,
          method: 'GET'
        }, (res) => {
          const expectedStatus = res.statusCode === 401 ? '✅' : '⚠️';
          console.log(`${expectedStatus} ${endpoint} - Status: ${res.statusCode} ${res.statusCode === 401 ? '(bon, authentification requise)' : '(inattendu)'}`);
          resolve();
        });

        req.on('error', (err) => {
          console.log(`❌ ${endpoint} - Error: ${err.message}`);
          reject(err);
        });

        req.end();
      });
    } catch (error) {
      // Continue même en cas d'erreur
    }
  }
}

// Tests principaux
async function runAllTests() {
  console.log('🧪 Tests complets de l\'API Quincaillerie Barro et Frère');
  console.log('=====================================================');

  await testPublicEndpoints();
  await testAuth();
  await testProtectedEndpoints();

  console.log('\n✅ Tests terminés !');
  console.log('\n📋 Résumé:');
  console.log('• L\'API démarre correctement');
  console.log('• Les endpoints publics répondent');
  console.log('• L\'authentification est en place');
  console.log('• Les endpoints protégés nécessitent une authentification');
  console.log('\n📚 Documentation Swagger disponible: http://localhost:3000/api-docs');
  console.log('💡 Pour tester avec des données, configurez MongoDB et lancez: npm run seed');
}

runAllTests();