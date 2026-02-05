const http = require('http');

// Configurações
const API_HOST = 'localhost';
const API_PORT = 3000;
const EMAIL = 'admin@jsbeauty.com';
const PASSWORD = 'admin123';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          // Tenta parsear JSON, se falhar retorna texto puro
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTest() {
  console.log('--- Iniciando Teste de Conexão com API ---');

  // 1. Tentar Login
  console.log('\n1. Tentando Login...');
  try {
    const loginRes = await request('POST', '/auth/login', {
      email: EMAIL,
      senha: PASSWORD // Alguns sistemas usam 'password', vamos checar o payload correto se falhar
    });

    console.log(`Status Login: ${loginRes.statusCode}`);
    
    if (loginRes.statusCode !== 200 && loginRes.statusCode !== 201) {
      console.log('Login falhou. Tentando payload alternativo (password vs senha)...');
      // Tentativa 2 com 'password'
       const loginRes2 = await request('POST', '/auth/login', {
        email: EMAIL,
        password: PASSWORD
      });
      if (loginRes2.statusCode === 200 || loginRes2.statusCode === 201) {
         console.log('Login recuperado com campo "password".');
         handleDashboardTest(loginRes2.data.access_token);
         return;
      }
      
      console.error('Falha crítica no login:', loginRes.data);
      console.log('Se o status for 401/404, verifique se o backend está rodando e se o usuário existe (seed).');
      return;
    }

    const token = loginRes.data.access_token || loginRes.data.token;
    if (!token) {
      console.error('Login com sucesso mas sem token na resposta:', loginRes.data);
      return;
    }

    console.log('Login OK. Token recebido.');
    await handleDashboardTest(token);

  } catch (err) {
    console.error('Erro de conexão (o backend está rodando?):', err.message);
  }
}

async function handleDashboardTest(token) {
  // 2. Testar Dashboard Financeiro (Resumo)
  console.log('\n2. Testando GET /dashboard/financeiro ...');
  const finRes = await request('GET', '/dashboard/financeiro', null, token);
  console.log(`Status: ${finRes.statusCode}`);
  if (finRes.statusCode !== 200) {
      console.log('Erro no Financeiro:', finRes.data);
  } else {
      console.log('Financeiro OK. Keys:', Object.keys(finRes.data));
  }

  // 3. Testar Previsão Entrada
  console.log('\n3. Testando GET /dashboard/previsao-entrada ...');
  const prevRes = await request('GET', '/dashboard/previsao-entrada?periodo=7d', null, token);
  console.log(`Status: ${prevRes.statusCode}`);
  
  if (prevRes.statusCode === 200) {
    console.log('SUCESSO! O backend retornou:');
    console.log(JSON.stringify(prevRes.data, null, 2));
  } else {
    console.error('FALHA na rota de previsão:', prevRes.statusCode);
    console.error('Erro:', JSON.stringify(prevRes.data, null, 2));
  }
}

runTest();
