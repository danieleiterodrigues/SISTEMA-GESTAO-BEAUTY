const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

async function main() {
  console.log('⏳ Testing database connection with Prisma...');
  try {
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    // Optional: Check if we can query
    const count = await prisma.usuario.count();
    console.log(`📊 Current user count: ${count}`);
    
  } catch (e) {
    console.error('❌ Connection failed!');
    console.error('Error details:', e.message);
    
    if (e.message.includes('Authentication failed')) {
      console.log('\n💡 DIAGNOSIS: Password mismatch likely.');
      console.log('   The database container probably has an old password in its volume.');
      console.log('   SOLUTION: Run "docker-compose down -v" to reset the database volume.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
