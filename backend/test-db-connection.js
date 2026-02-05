const { Client } = require('pg');

const config = {
    user: 'user',
    host: 'localhost',
    database: 'jsbeauty',
    password: 'password', // trying configured password
    port: 5433,
};

async function testConnection() {
    console.log('Testing connection with config:', config);
    const client = new Client(config);
    try {
        await client.connect();
        console.log('✅ Connection successful!');
        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        console.log('If "password authentication failed", the Docker volume might have an old password.');
        console.log('You might need to: docker-compose down -v  (WARNING: deletes data) and then docker-compose up -d');
    }
}

testConnection();
