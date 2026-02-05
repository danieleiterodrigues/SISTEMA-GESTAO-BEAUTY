import { PrismaClient, TipoAtendimento, StatusAtendimento, StatusPacoteVenda } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando verificação do Dashboard...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  console.log('Data de hoje:', today);

  const startDate = today;
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 7);
  console.log('Periodo:', startDate, 'até', endDate);

  // Teste 1: Atendimentos (Serviços Sociais)
  console.log('\n--- Teste 1: Buscando Serviços Sociais ---');
  try {
    const servicosSociais = await prisma.atendimento.findMany({
      where: {
        tipo: TipoAtendimento.servico_social,
        dataAtendimento: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: [StatusAtendimento.agendado] },
      },
      include: {
        cliente: true,
      },
    });
    console.log(`Sucesso! Encontrados ${servicosSociais.length} serviços sociais.`);
    if (servicosSociais.length > 0) {
      console.log('Exemplo:', JSON.stringify(servicosSociais[0], null, 2));
    }
  } catch (error) {
    console.error('ERRO ao buscar Serviços Sociais:', error);
  }

  // Teste 2: PacoteVenda
  console.log('\n--- Teste 2: Buscando Pacotes ---');
  const eventStartDate = new Date(startDate);
  eventStartDate.setDate(eventStartDate.getDate() + 10);
  const eventEndDate = new Date(endDate);
  eventEndDate.setDate(eventEndDate.getDate() + 10);

  console.log('Intervalo de eventos:', eventStartDate, 'até', eventEndDate);

  try {
    const pacotes = await prisma.pacoteVenda.findMany({
      where: {
        dataEvento: {
          gte: eventStartDate,
          lte: eventEndDate,
        },
        status: StatusPacoteVenda.ativo,
      },
      include: {
        cliente: true,
        pacote: true,
      },
    });
    console.log(`Sucesso! Encontrados ${pacotes.length} pacotes.`);
    if (pacotes.length > 0) {
      console.log('Exemplo:', JSON.stringify(pacotes[0], null, 2));
    }
  } catch (error) {
    console.error('ERRO ao buscar Pacotes:', error);
    console.error('Possível causa: A tabela PacoteVenda não existe ou o Prisma Client não foi regenerado.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
