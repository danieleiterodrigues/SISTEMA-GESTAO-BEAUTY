
import { PrismaClient } from '@prisma/client';
// Import directly from the file to test the service logic
import { DashboardService } from './src/modules/dashboard/dashboard.service';
import { PrismaService } from './src/prisma/prisma.service';

async function main() {
  console.log('Iniciando verificação do DashboardService...');

  const prisma = new PrismaService();
  
  try {
    await prisma.onModuleInit();
    console.log('Conexão com Banco de Dados estabelecida.');

    const dashboardService = new DashboardService(prisma);
    console.log('DashboardService instanciado.');

    console.log('\n--- Teste: getPrevisaoEntrada (padrao 7d) ---');
    const result = await dashboardService.getPrevisaoEntrada({});
    console.log('Resultado obtido com sucesso!');
    console.log(JSON.stringify(result, null, 2));

    if (result.alertas) {
        console.log('\nAlertas calculados:');
        console.log(result.alertas);
    }

  } catch (error) {
    console.error('ERRO FATAL durante a execução do serviço:', error);
    if (error instanceof Error) {
        console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.onModuleDestroy();
    console.log('\nConexão encerrada.');
  }
}

main();
