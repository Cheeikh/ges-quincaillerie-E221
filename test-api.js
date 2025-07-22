const http = require('http');

// Fonction pour tester un endpoint
function testEndpoint(path, expectedStatus = 200) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ ${path} - Status: ${res.statusCode}`);
        if (res.statusCode === expectedStatus) {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } else {
          reject(new Error(`Expected ${expectedStatus}, got ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${path} - Error: ${err.message}`);
      reject(err);
    });

    req.end();
  });
}

// Tests
async function runTests() {
  console.log('🧪 Test de l\'API Quincaillerie Barro et Frère\n');

  try {
    // Test de la route racine
    const rootResponse = await testEndpoint('/');
    console.log('📋 Réponse racine:', rootResponse.data.message);

    // Test de l'endpoint health
    const healthResponse = await testEndpoint('/api/health');
    console.log('💚 Health check:', healthResponse.data.message);

    console.log('\n✅ Tous les tests sont passés !');
    console.log('\n📚 Pour la documentation complète: http://localhost:3000/api-docs');
    
  } catch (error) {
    console.log('\n❌ Erreur lors des tests:', error.message);
    console.log('\n🔧 Assurez-vous que l\'application est démarrée avec: npm run dev');
  }
}

runTests();