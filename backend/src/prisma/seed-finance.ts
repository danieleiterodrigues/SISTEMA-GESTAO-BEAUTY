import { PrismaClient, TipoAtendimento, StatusAtendimento, StatusPacoteVenda } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed Financeiro ---');

  // 1. Criar Cliente
  const cliente = await prisma.cliente.upsert({
    where: { cpf: '000.000.000-00' },
    update: {},
    create: {
      nome: 'Cliente Teste Financeiro',
      cpf: '000.000.000-00',
      telefone: '11999999999',
      status: 'ativo'
    }
  });
  console.log('Cliente criado/verificado:', cliente.nome);

  // 2. Criar Colaborador (necessário para atendimento)
  const colaborador = await prisma.colaborador.findFirst();
  if (!colaborador) {
    console.error('ERRO: Nenhum colaborador encontrado. Rode o seed principal primeiro para criar usuários/colaboradores base se necessario, ou crie um aqui.');
     // Vamos criar um dummy se não existir
     await prisma.colaborador.create({
         data: {
             nome: 'Colaborador Teste',
             tipo: 'profissional',
             ativo: true,
             // usuarioId não obrigatorio no schema para criação direta isolada se nullable, mas vamos ver
         }
     });
     // Recarregar
  }
  const colabFinal = await prisma.colaborador.findFirst();

  // Datas
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 3); // Daqui 3 dias (dentro do periodo 7d)
  
  const eventDate = new Date(today);
  eventDate.setDate(today.getDate() + 14); // Daqui 14 dias
  // Quitação = Evento - 10 = Daqui 4 dias. (Dentro do periodo 7d)

  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 5); // 5 dias atras (Atrasado)

  // 3. Atendimento Serviço Social (Futuro - Entra na Previsão)
  await prisma.atendimento.create({
    data: {
      clienteId: cliente.id,
      colaboradorId: colabFinal!.id,
      tipo: TipoAtendimento.servico_social,
      dataAtendimento: nextWeek,
      horarioInicio: new Date('2024-01-01T10:00:00Z'), // Dummy time
      status: StatusAtendimento.agendado,
      valorTotal: 150.00,
      valorPago: 50.00, // Falta 100
      observacoes: 'Serviço Social Teste'
    }
  });
  console.log('Serviço Social (Futuro) criado.');

  // 4. Pacote (Futuro - Entra na Previsão)
  const pacote = await prisma.pacote.create({
    data: {
      nome: 'Pacote Noiva Teste',
      valor: 2000.00,
      ativo: true
    }
  });

  await prisma.pacoteVenda.create({
    data: {
      clienteId: cliente.id,
      pacoteId: pacote.id,
      dataEvento: eventDate,
      valorTotal: 2000.00,
      valorPago: 500.00, // Falta 1500
      status: StatusPacoteVenda.ativo,
      observacoes: 'Pacote Teste Previsão'
    }
  });
  console.log('Pacote Venda (Futuro) criado.');

  // 5. Atendimento Serviço Social (Passado - Atrasado/Alerta)
  await prisma.atendimento.create({
    data: {
      clienteId: cliente.id,
      colaboradorId: colabFinal!.id,
      tipo: TipoAtendimento.servico_social,
      dataAtendimento: pastDate,
      horarioInicio: new Date('2024-01-01T10:00:00Z'),
      status: StatusAtendimento.agendado, // Ainda agendado mas data ja passou
      valorTotal: 200.00,
      valorPago: 0.00, // Tudo pendente
      observacoes: 'Serviço Social Atrasado'
    }
  });
  console.log('Serviço Social (Atrasado) criado.');

  console.log('--- Seed Financeiro Concluído ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
