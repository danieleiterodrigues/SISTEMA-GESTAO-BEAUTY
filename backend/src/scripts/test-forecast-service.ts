
import { Test } from '@nestjs/testing';
import { DashboardModule } from '../modules/dashboard/dashboard.module';
import { DashboardService } from '../modules/dashboard/dashboard.service';

async function main() {
  console.log('--- Iniciando Teste de Integração do DashboardService ---');

  const moduleRef = await Test.createTestingModule({
    imports: [DashboardModule],
  }).compile();

  const dashboardService = moduleRef.get<DashboardService>(DashboardService);

  // Testar período de 30 dias para cobrir o evento daqui a 20 dias
  console.log('Consultando Previsão de Entrada para os próximos 30 dias...');
  const result30d = await dashboardService.getPrevisaoEntrada({ periodo: '30d' });

  console.log('\n--- Resultado (30 dias) ---');
  console.log(JSON.stringify(result30d, null, 2));

  // Validações básicas no log
  const hasSocial = result30d.proximas_quitacoes.some((q: any) => q.tipo === 'servico_social');
  const hasPacote = result30d.proximas_quitacoes.some((q: any) => q.tipo === 'pacote');

  console.log('\n--- Validação ---');
  console.log(`Encontrou Serviço Social? ${hasSocial ? 'SIM' : 'NÃO'}`);
  console.log(`Encontrou Pacote? ${hasPacote ? 'SIM' : 'NÃO'}`);
  
  if (hasSocial && hasPacote) {
      console.log('✅ SUCESSO: O serviço retornou ambos os tipos de previsão esperados.');
  } else {
      console.log('❌ FALHA: Faltam dados na previsão.');
  }
}

main();
