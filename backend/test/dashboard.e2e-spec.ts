
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtAuthGuard } from './../src/shared/guards/jwt-auth.guard';
import { PrismaService } from './../src/prisma/prisma.service';
import { TipoAtendimento, StatusAtendimento, StatusPacoteVenda } from '@prisma/client';

describe('DashboardController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();

    // Clean any leftovers from previous failed runs first
    await cleanData();
  });

  afterAll(async () => {
    await cleanData();
    await app.close();
  });

  async function cleanData() {
    // Delete in reverse order of dependencies
    const namesToDelete = [
      'Maria Silva Teste', 
      'Ana Costa Teste'
    ];

    const clientes = await prisma.cliente.findMany({ where: { nome: { in: namesToDelete } } });
    const clienteIds = clientes.map(c => c.id);

    if (clienteIds.length > 0) {
      await prisma.pacoteVenda.deleteMany({ where: { clienteId: { in: clienteIds } } });
      await prisma.atendimento.deleteMany({ where: { clienteId: { in: clienteIds } } });
      await prisma.cliente.deleteMany({ where: { id: { in: clienteIds } } });
    }
  }

  async function seedData() {
    const now = new Date();
    
    // 1. Ensure Colaborador and Pacote
    const colaborador = await prisma.colaborador.findFirst({ where: { nome: 'Colaborador Teste' } }) 
      || await prisma.colaborador.create({
        data: {
            nome: 'Colaborador Teste',
            tipo: 'profissional',
            ativo: true,
        }
      });
      
    // Check if Pacote exists or create
    const pacote = await prisma.pacote.findFirst({ where: { nome: 'Pacote Noiva Premium Teste' } })
      || await prisma.pacote.create({
        data: {
          nome: 'Pacote Noiva Premium Teste',
          valor: 5000.00,
          ativo: true
        }
      });

    // 2. Create Clientes
    const clienteMaria = await prisma.cliente.create({
      data: {
        nome: 'Maria Silva Teste',
        telefone: '11987654321',
        status: 'ativo'
      }
    });

    const clienteAna = await prisma.cliente.create({
      data: {
        nome: 'Ana Costa Teste',
        telefone: '11976543210',
        status: 'ativo'
      }
    });

    // 3. Create Atendimento (Servico Social)
    // Date: Now + 5 days
    const dataAtendimento = new Date(now);
    dataAtendimento.setDate(dataAtendimento.getDate() + 5);
    
    await prisma.atendimento.create({
      data: {
        clienteId: clienteMaria.id,
        colaboradorId: colaborador.id,
        tipo: TipoAtendimento.servico_social,
        dataAtendimento: dataAtendimento,
        horarioInicio: new Date(), 
        status: StatusAtendimento.agendado,
        valorTotal: 400.00,
        valorPago: 100.00
      }
    });

    // 4. Create Pacote Venda
    // Date Evento: Now + 20 days
    const dataEvento = new Date(now);
    dataEvento.setDate(dataEvento.getDate() + 20);

    await prisma.pacoteVenda.create({
      data: {
        clienteId: clienteAna.id,
        pacoteId: pacote.id,
        dataVenda: new Date(),
        dataEvento: dataEvento,
        valorTotal: 5000.00,
        valorPago: 2500.00,
        status: StatusPacoteVenda.ativo
      }
    });
  }

  it('/dashboard/previsao-entrada (GET) - Periodo 30d (Baseline Delta)', async () => {
    // 1. Get Baseline (Initial State)
    const responseBefore = await request(app.getHttpServer())
      .get('/dashboard/previsao-entrada?periodo=30d')
      .expect(200);
    
    const initialResumo = responseBefore.body.resumo;

    // 2. Seed Data
    await seedData();

    // 3. Get Final State
    const responseAfter = await request(app.getHttpServer())
      .get('/dashboard/previsao-entrada?periodo=30d')
      .expect(200);

    const body = responseAfter.body;
    const finalResumo = body.resumo;

    console.log('Initial Social Qty:', initialResumo.servicos_sociais.quantidade);
    console.log('Final Social Qty:', finalResumo.servicos_sociais.quantidade);

    // 4. Assert Delta
    // We added 1 Servico Social (Val: 300) and 1 Pacote (Val: 2500)
    
    expect(body).toHaveProperty('periodo', '30d');
    
    // Resume Checks - Delta
    expect(finalResumo.servicos_sociais.quantidade).toBe(initialResumo.servicos_sociais.quantidade + 1);
    expect(finalResumo.servicos_sociais.valor_total).toBe(initialResumo.servicos_sociais.valor_total + 300);
    
    expect(finalResumo.pacotes.quantidade).toBe(initialResumo.pacotes.quantidade + 1);
    expect(finalResumo.pacotes.valor_total).toBe(initialResumo.pacotes.valor_total + 2500);

    // List Checks 
    // We check if OUR created items are in the list
    const quitacoes = body.proximas_quitacoes;
    
    const social = quitacoes.find(q => q.cliente_nome === 'Maria Silva Teste');
    const pacote = quitacoes.find(q => q.cliente_nome === 'Ana Costa Teste');

    expect(social).toBeDefined();
    expect(social.saldo_pendente).toBe(300);
    expect(social.tipo).toBe('servico_social');

    expect(pacote).toBeDefined();
    expect(pacote.saldo_pendente).toBe(2500);
    expect(pacote.tipo).toBe('pacote');
    expect(pacote.descricao).toContain('Pacote Noiva Premium Teste');
  });
});
