import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // 1. Criar Usuário Admin
  const senhaHash = await bcrypt.hash('admin123', 10);
  const adminEmail = 'admin@jsbeauty.com';
  
  const adminExists = await prisma.usuario.findUnique({ where: { email: adminEmail } });

  if (!adminExists) {
    await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email: adminEmail,
        senhaHash: senhaHash,
        perfil: 'admin',
        ativo: true,
      },
    });
    console.log('Usuario Admin criado.');
  } else {
    console.log('Usuario Admin ja existe.');
  }

  // 2. Criar Categorias e Serviços
  // Mapeamento baseado no PRD, mas adaptado para a estrutura Relacional (Categoria -> Servico)
  
  const categoriasData = [
    { nome: 'Cabelo' },
    { nome: 'Unhas' },
    { nome: 'Design' },
    { nome: 'Depilação' },
    { nome: 'Estética' },
  ];

  for (const cat of categoriasData) {
    await prisma.categoria.upsert({
      where: { nome: cat.nome },
      update: {},
      create: { nome: cat.nome },
    });
  }
  console.log('Categorias criadas/verificadas.');

  // Recuperar categorias para obter IDs
  const catCabelo = await prisma.categoria.findUnique({ where: { nome: 'Cabelo' } });
  const catUnhas = await prisma.categoria.findUnique({ where: { nome: 'Unhas' } });
  const catDesign = await prisma.categoria.findUnique({ where: { nome: 'Design' } });
  const catDepilacao = await prisma.categoria.findUnique({ where: { nome: 'Depilação' } });
  const catEstetica = await prisma.categoria.findUnique({ where: { nome: 'Estética' } });

  const servicosData: Prisma.ServicoCreateInput[] = [
    {
      nome: 'Corte Feminino',
      duracaoMinutos: 60,
      valor: 80.00,
      comissaoTipo: 'percentual',
      comissaoValor: 30.00,
      categoria: { connect: { id: catCabelo?.id } },
    },
    {
      nome: 'Corte Masculino',
      duracaoMinutos: 30,
      valor: 40.00,
      comissaoTipo: 'percentual',
      comissaoValor: 30.00,
      categoria: { connect: { id: catCabelo?.id } },
    },
    {
      nome: 'Coloração Completa',
      duracaoMinutos: 120,
      valor: 150.00,
      comissaoTipo: 'percentual',
      comissaoValor: 25.00,
      categoria: { connect: { id: catCabelo?.id } },
    },
    {
      nome: 'Escova',
      duracaoMinutos: 45,
      valor: 50.00,
      comissaoTipo: 'percentual',
      comissaoValor: 30.00,
      categoria: { connect: { id: catCabelo?.id } },
    },
    {
      nome: 'Manicure',
      duracaoMinutos: 40,
      valor: 35.00,
      comissaoTipo: 'percentual',
      comissaoValor: 35.00,
      categoria: { connect: { id: catUnhas?.id } },
    },
    {
      nome: 'Pedicure',
      duracaoMinutos: 50,
      valor: 45.00,
      comissaoTipo: 'percentual',
      comissaoValor: 35.00,
      categoria: { connect: { id: catUnhas?.id } },
    },
    {
      nome: 'Design de Sobrancelhas',
      duracaoMinutos: 30,
      valor: 30.00,
      comissaoTipo: 'percentual',
      comissaoValor: 40.00,
      categoria: { connect: { id: catDesign?.id } },
    },
    {
      nome: 'Depilação Facial',
      duracaoMinutos: 20,
      valor: 25.00,
      comissaoTipo: 'percentual',
      comissaoValor: 30.00,
      categoria: { connect: { id: catDepilacao?.id } },
    },
    {
      nome: 'Massagem Relaxante',
      duracaoMinutos: 60,
      valor: 100.00,
      comissaoTipo: 'percentual',
      comissaoValor: 30.00,
      categoria: { connect: { id: catEstetica?.id } },
    },
    {
      nome: 'Limpeza de Pele',
      duracaoMinutos: 90,
      valor: 120.00,
      comissaoTipo: 'percentual',
      comissaoValor: 25.00,
      categoria: { connect: { id: catEstetica?.id } },
    },
  ];

  for (const s of servicosData) {
    // Verificar se ja existe pelo nome
    const exists = await prisma.servico.findFirst({ where: { nome: s.nome } });
    if (!exists) {
        await prisma.servico.create({ data: s });
    }
  }
  console.log('Servicos criados.');

  // 3. Taxas Maquininha
  const taxasData = [
    { bandeira: 'Visa', tipoTransacao: 'debito', parcelas: 1, taxaPercentual: 1.99 },
    { bandeira: 'Mastercard', tipoTransacao: 'debito', parcelas: 1, taxaPercentual: 1.99 },
    { bandeira: 'Elo', tipoTransacao: 'debito', parcelas: 1, taxaPercentual: 1.99 },
    { bandeira: 'Visa', tipoTransacao: 'credito', parcelas: 1, taxaPercentual: 2.99 },
    { bandeira: 'Visa', tipoTransacao: 'credito', parcelas: 2, taxaPercentual: 4.49 },
    { bandeira: 'Visa', tipoTransacao: 'credito', parcelas: 3, taxaPercentual: 5.99 },
    { bandeira: 'Visa', tipoTransacao: 'credito', parcelas: 4, taxaPercentual: 6.99 },
    { bandeira: 'Visa', tipoTransacao: 'credito', parcelas: 5, taxaPercentual: 7.99 },
    { bandeira: 'Visa', tipoTransacao: 'credito', parcelas: 6, taxaPercentual: 8.99 },
    { bandeira: 'Mastercard', tipoTransacao: 'credito', parcelas: 1, taxaPercentual: 2.99 },
    { bandeira: 'Mastercard', tipoTransacao: 'credito', parcelas: 2, taxaPercentual: 4.49 },
    { bandeira: 'Mastercard', tipoTransacao: 'credito', parcelas: 3, taxaPercentual: 5.99 },
  ];

  for (const t of taxasData) {
     const exists = await prisma.taxaMaquininha.findUnique({
         where: {
             bandeira_tipoTransacao_parcelas: {
                 bandeira: t.bandeira,
                 tipoTransacao: t.tipoTransacao as any,
                 parcelas: t.parcelas
             }
         }
     });

     if(!exists) {
         await prisma.taxaMaquininha.create({
             data: {
                 bandeira: t.bandeira,
                 tipoTransacao: t.tipoTransacao as any,
                 parcelas: t.parcelas,
                 taxaPercentual: t.taxaPercentual,
                 ativo: true
             }
         })
     }
  }

  console.log('Taxas de maquininha criadas.');
  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
