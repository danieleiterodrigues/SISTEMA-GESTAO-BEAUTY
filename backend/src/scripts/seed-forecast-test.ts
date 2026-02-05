
import { PrismaClient, TipoAtendimento, StatusAtendimento, StatusPacoteVenda } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Script de Teste de Previsão Financeira ---');

  // 1. Criar ou buscar Clientes
  console.log('1. Verificando Clientes...');
  
  let cliente1 = await prisma.cliente.findFirst({ where: { email: 'maria.silva@teste.com' } });
  if (!cliente1) {
    cliente1 = await prisma.cliente.create({
      data: {
        nome: 'Maria Silva (Madrinha)',
        telefone: '11987654321',
        email: 'maria.silva@teste.com',
        status: 'ativo'
      }
    });
    console.log('   -> Cliente criado: Maria Silva');
  } else {
    console.log('   -> Cliente existente: Maria Silva');
  }

  let cliente2 = await prisma.cliente.findFirst({ where: { email: 'ana.costa@teste.com' } });
  if (!cliente2) {
    cliente2 = await prisma.cliente.create({
      data: {
        nome: 'Ana Costa (Noiva)',
        telefone: '11976543210',
        email: 'ana.costa@teste.com',
        status: 'ativo'
      }
    });
    console.log('   -> Cliente criado: Ana Costa');
  } else {
    console.log('   -> Cliente existente: Ana Costa');
  }

  // 2. Criar ou buscar Colaborador (necessário para atendimento)
  let colaborador = await prisma.colaborador.findFirst({ where: { nome: 'Colaborador Teste' } });
  if (!colaborador) {
    colaborador = await prisma.colaborador.create({
      data: {
        nome: 'Colaborador Teste',
        tipo: 'profissional',
        ativo: true
      }
    });
    console.log('   -> Colaborador criado: Colaborador Teste');
  }

  // 3. Criar Atendimento (Serviço Social)
  console.log('2. Criando Atendimento (Serviço Social)...');
  const dataSocial = new Date();
  dataSocial.setDate(dataSocial.getDate() + 5); // +5 dias

  const atendimento = await prisma.atendimento.create({
    data: {
      clienteId: cliente1.id,
      colaboradorId: colaborador.id,
      tipo: TipoAtendimento.servico_social,
      dataAtendimento: dataSocial,
      horarioInicio: new Date(`${dataSocial.toISOString().split('T')[0]}T14:00:00`),
      horarioFim: new Date(`${dataSocial.toISOString().split('T')[0]}T16:00:00`),
      status: StatusAtendimento.agendado,
      valorTotal: 400.00,
      valorPago: 100.00, // Saldo pendente: 300.00
      observacoes: 'Teste de Serviço Social com saldo pendente'
    }
  });
  console.log(`   -> Atendimento criado ID: ${atendimento.id}, Saldo Pendente: ${Number(atendimento.valorTotal) - Number(atendimento.valorPago)}`);

  // 4. Criar Pacote e Venda de Pacote
  console.log('3. Criando Pacote e Venda...');
  
  let pacote = await prisma.pacote.findFirst({ where: { nome: 'Pacote Noiva Premium Teste' } });
  if (!pacote) {
    pacote = await prisma.pacote.create({
      data: {
        nome: 'Pacote Noiva Premium Teste',
        valor: 5000.00,
        validadeDias: 365,
        descricao: 'Pacote completo para noivas'
      }
    });
  }

  const dataEvento = new Date();
  dataEvento.setDate(dataEvento.getDate() + 20); // +20 dias
  // Data Quitação Esperada: dataEvento - 10 dias = +10 dias a partir de hoje

  const vendaPacote = await prisma.pacoteVenda.create({
    data: {
      clienteId: cliente2.id,
      pacoteId: pacote.id,
      dataVenda: new Date(),
      dataEvento: dataEvento,
      valorTotal: 5000.00,
      valorPago: 2500.00, // Saldo pendente: 2500.00
      status: StatusPacoteVenda.ativo
    }
  });
  console.log(`   -> Venda de Pacote criada ID: ${vendaPacote.id}, Data Evento: ${dataEvento.toISOString().split('T')[0]}`);
  console.log(`      Data Quitação (Evento - 10 dias): ${new Date(dataEvento.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`);
  console.log(`      Saldo Pendente: ${Number(vendaPacote.valorTotal) - Number(vendaPacote.valorPago)}`);

  console.log('--- Script Finalizado com Sucesso ---');
  console.log('Agora você pode verificar a rota /dashboard/previsao-entrada para ver esses dados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
