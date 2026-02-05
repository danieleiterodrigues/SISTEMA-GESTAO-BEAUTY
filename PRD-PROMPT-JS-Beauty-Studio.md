# PRD-PROMPT: Sistema de Gestão JS Beauty Studio

## CONTEXTO E OBJETIVO

Você é um desenvolvedor full-stack sênior responsável por construir um sistema completo de gestão para o JS Beauty Studio, um salão de beleza. O sistema deve gerenciar todas as operações do negócio: financeiro, comercial, atendimentos e administração.

## STACK TECNOLÓGICA OBRIGATÓRIA

### Backend
- **Runtime**: Node.js 18+ com TypeScript
- **Framework**: NestJS (preferencial) ou Express
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL 15+
- **Autenticação**: JWT com bcrypt
- **Validação**: class-validator e class-transformer (NestJS) ou Zod
- **Testes**: Jest

### Frontend
- **Framework**: React 18+ com TypeScript
- **Build Tool**: Vite
- **Estilo**: TailwindCSS
- **Roteamento**: React Router v6
- **Estado Global**: Zustand
- **Requisições**: Axios + React Query (TanStack Query)
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide React
- **Notificações**: React Hot Toast

### DevOps
- **Controle de Versão**: Git (GitHub)
- **CI/CD**: GitHub Actions
- **Containerização**: Docker + Docker Compose
- **Hospedagem**: Railway ou Vercel (frontend) + Render (backend)

## ARQUITETURA DO SISTEMA

### Estrutura Backend (NestJS)
```
backend/
├── src/
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── env.validation.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── clientes/
│   │   │   ├── clientes.controller.ts
│   │   │   ├── clientes.service.ts
│   │   │   ├── clientes.module.ts
│   │   │   └── dto/
│   │   ├── servicos/
│   │   ├── atendimentos/
│   │   ├── vendas/
│   │   ├── despesas/
│   │   ├── colaboradores/
│   │   ├── pacotes/
│   │   ├── produtos/
│   │   └── financeiro/
│   ├── shared/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── interceptors/
│   │   └── filters/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
├── .env.example
├── .env
├── docker-compose.yml
├── Dockerfile
└── package.json
```

### Estrutura Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Card.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MainLayout.tsx
│   │   └── forms/
│   │       ├── ClienteForm.tsx
│   │       ├── ServicoForm.tsx
│   │       └── AtendimentoForm.tsx
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   ├── DashboardFinanceiro.tsx
│   │   │   ├── DashboardAtendimento.tsx
│   │   │   └── DashboardComercial.tsx
│   │   ├── Clientes/
│   │   │   ├── ListaClientes.tsx
│   │   │   ├── DetalheCliente.tsx
│   │   │   └── index.tsx
│   │   ├── Atendimentos/
│   │   │   ├── Agenda.tsx
│   │   │   └── Comandas.tsx
│   │   ├── Financeiro/
│   │   │   ├── FluxoCaixa.tsx
│   │   │   ├── Vendas.tsx
│   │   │   └── Despesas.tsx
│   │   ├── Admin/
│   │   │   ├── Servicos.tsx
│   │   │   ├── Colaboradores.tsx
│   │   │   ├── Pacotes.tsx
│   │   │   └── Produtos.tsx
│   │   └── Login.tsx
│   ├── services/
│   │   ├── api.ts (configuração axios)
│   │   ├── auth.service.ts
│   │   ├── clientes.service.ts
│   │   ├── atendimentos.service.ts
│   │   └── financeiro.service.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useClientes.ts
│   │   ├── useAtendimentos.ts
│   │   └── useDebounce.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   └── appStore.ts
│   ├── types/
│   │   ├── cliente.types.ts
│   │   ├── atendimento.types.ts
│   │   └── venda.types.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   └── PrivateRoute.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── .env.example
├── .env
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## MODELO DE DADOS (PRISMA SCHEMA)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Usuario {
  id           Int          @id @default(autoincrement())
  nome         String       @db.VarChar(100)
  email        String       @unique @db.VarChar(100)
  senhaHash    String       @map("senha_hash") @db.VarChar(255)
  perfil       Perfil
  ativo        Boolean      @default(true)
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")
  
  colaborador  Colaborador?

  @@map("usuarios")
}

model Cliente {
  id              Int          @id @default(autoincrement())
  nome            String       @db.VarChar(100)
  telefone        String       @db.VarChar(20)
  email           String?      @db.VarChar(100)
  dataNascimento  DateTime?    @map("data_nascimento") @db.Date
  cpf             String?      @unique @db.VarChar(14)
  endereco        String?      @db.Text
  cidade          String?      @db.VarChar(100)
  estado          String?      @db.VarChar(2)
  cep             String?      @db.VarChar(9)
  observacoes     String?      @db.Text
  status          StatusCliente @default(ativo)
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")
  ultimaVisita    DateTime?    @map("ultima_visita")
  
  atendimentos    Atendimento[]
  vendas          Venda[]

  @@index([nome])
  @@index([telefone])
  @@index([cpf])
  @@map("clientes")
}

model Colaborador {
  id              Int          @id @default(autoincrement())
  nome            String       @db.VarChar(100)
  tipo            TipoColaborador
  telefone        String?      @db.VarChar(20)
  email           String?      @db.VarChar(100)
  cpf             String?      @unique @db.VarChar(14)
  dataAdmissao    DateTime?    @map("data_admissao") @db.Date
  comissaoPadrao  Decimal?     @map("comissao_padrao") @db.Decimal(5, 2)
  usuarioId       Int?         @unique @map("usuario_id")
  ativo           Boolean      @default(true)
  createdAt       DateTime     @default(now()) @map("created_at")
  
  usuario         Usuario?     @relation(fields: [usuarioId], references: [id])
  atendimentos    Atendimento[]
  comissoes       Comissao[]

  @@map("colaboradores")
}

model Servico {
  id                Int          @id @default(autoincrement())
  nome              String       @db.VarChar(100)
  descricao         String?      @db.Text
  categoria         String?      @db.VarChar(50)
  duracaoMinutos    Int          @map("duracao_minutos")
  valor             Decimal      @db.Decimal(10, 2)
  comissaoTipo      ComissaoTipo @map("comissao_tipo")
  comissaoValor     Decimal      @map("comissao_valor") @db.Decimal(10, 2)
  ativo             Boolean      @default(true)
  createdAt         DateTime     @default(now()) @map("created_at")
  
  atendimentoServicos AtendimentoServico[]
  pacoteServicos      PacoteServico[]

  @@map("servicos")
}

model Pacote {
  id              Int          @id @default(autoincrement())
  nome            String       @db.VarChar(100)
  descricao       String?      @db.Text
  valor           Decimal      @db.Decimal(10, 2)
  validadeDias    Int?         @map("validade_dias")
  ativo           Boolean      @default(true)
  createdAt       DateTime     @default(now()) @map("created_at")
  
  servicos        PacoteServico[]

  @@map("pacotes")
}

model PacoteServico {
  id          Int      @id @default(autoincrement())
  pacoteId    Int      @map("pacote_id")
  servicoId   Int      @map("servico_id")
  quantidade  Int      @default(1)
  
  pacote      Pacote   @relation(fields: [pacoteId], references: [id])
  servico     Servico  @relation(fields: [servicoId], references: [id])

  @@map("pacote_servicos")
}

model Produto {
  id              Int          @id @default(autoincrement())
  nome            String       @db.VarChar(100)
  descricao       String?      @db.Text
  codigoBarras    String?      @map("codigo_barras") @db.VarChar(50)
  categoria       String?      @db.VarChar(50)
  valorCusto      Decimal?     @map("valor_custo") @db.Decimal(10, 2)
  valorVenda      Decimal      @map("valor_venda") @db.Decimal(10, 2)
  estoqueAtual    Int          @default(0) @map("estoque_atual")
  estoqueMinimo   Int          @default(0) @map("estoque_minimo")
  ativo           Boolean      @default(true)
  createdAt       DateTime     @default(now()) @map("created_at")

  @@map("produtos")
}

model Atendimento {
  id                Int          @id @default(autoincrement())
  clienteId         Int          @map("cliente_id")
  colaboradorId     Int          @map("colaborador_id")
  dataAtendimento   DateTime     @map("data_atendimento") @db.Date
  horarioInicio     DateTime     @map("horario_inicio") @db.Time
  horarioFim        DateTime?    @map("horario_fim") @db.Time
  status            StatusAtendimento
  observacoes       String?      @db.Text
  createdAt         DateTime     @default(now()) @map("created_at")
  updatedAt         DateTime     @updatedAt @map("updated_at")
  
  cliente           Cliente      @relation(fields: [clienteId], references: [id])
  colaborador       Colaborador  @relation(fields: [colaboradorId], references: [id])
  servicos          AtendimentoServico[]
  vendas            Venda[]

  @@index([dataAtendimento])
  @@index([clienteId])
  @@index([colaboradorId])
  @@map("atendimentos")
}

model AtendimentoServico {
  id              Int          @id @default(autoincrement())
  atendimentoId   Int          @map("atendimento_id")
  servicoId       Int          @map("servico_id")
  quantidade      Int          @default(1)
  valorUnitario   Decimal      @map("valor_unitario") @db.Decimal(10, 2)
  desconto        Decimal      @default(0) @db.Decimal(10, 2)
  
  atendimento     Atendimento  @relation(fields: [atendimentoId], references: [id])
  servico         Servico      @relation(fields: [servicoId], references: [id])
  comissoes       Comissao[]

  @@map("atendimento_servicos")
}

model Venda {
  id                Int          @id @default(autoincrement())
  clienteId         Int          @map("cliente_id")
  atendimentoId     Int?         @map("atendimento_id")
  tipoVenda         TipoVenda    @map("tipo_venda")
  dataVenda         DateTime     @map("data_venda") @db.Date
  valorTotal        Decimal      @map("valor_total") @db.Decimal(10, 2)
  desconto          Decimal      @default(0) @db.Decimal(10, 2)
  valorFinal        Decimal      @map("valor_final") @db.Decimal(10, 2)
  formaPagamento    FormaPagamento @map("forma_pagamento")
  statusPagamento   StatusPagamento @map("status_pagamento")
  parcelas          Int          @default(1)
  taxaMaquininha    Decimal?     @map("taxa_maquininha") @db.Decimal(5, 2)
  observacoes       String?      @db.Text
  createdAt         DateTime     @default(now()) @map("created_at")
  
  cliente           Cliente      @relation(fields: [clienteId], references: [id])
  atendimento       Atendimento? @relation(fields: [atendimentoId], references: [id])
  parcelasList      Parcela[]
  comissoes         Comissao[]

  @@index([dataVenda])
  @@index([clienteId])
  @@map("vendas")
}

model Parcela {
  id              Int          @id @default(autoincrement())
  vendaId         Int          @map("venda_id")
  numeroParcela   Int          @map("numero_parcela")
  valorParcela    Decimal      @map("valor_parcela") @db.Decimal(10, 2)
  dataVencimento  DateTime     @map("data_vencimento") @db.Date
  dataPagamento   DateTime?    @map("data_pagamento") @db.Date
  status          StatusParcela @default(pendente)
  createdAt       DateTime     @default(now()) @map("created_at")
  
  venda           Venda        @relation(fields: [vendaId], references: [id])

  @@map("parcelas")
}

model Despesa {
  id                Int          @id @default(autoincrement())
  descricao         String       @db.VarChar(200)
  categoria         String       @db.VarChar(50)
  valor             Decimal      @db.Decimal(10, 2)
  dataVencimento    DateTime     @map("data_vencimento") @db.Date
  dataPagamento     DateTime?    @map("data_pagamento") @db.Date
  status            StatusDespesa
  recorrente        Boolean      @default(false)
  periodicidade     String?      @db.VarChar(20)
  formaPagamento    String?      @map("forma_pagamento") @db.VarChar(50)
  observacoes       String?      @db.Text
  createdAt         DateTime     @default(now()) @map("created_at")

  @@index([dataVencimento])
  @@map("despesas")
}

model Comissao {
  id                      Int          @id @default(autoincrement())
  colaboradorId           Int          @map("colaborador_id")
  vendaId                 Int?         @map("venda_id")
  atendimentoServicoId    Int?         @map("atendimento_servico_id")
  valorBase               Decimal      @map("valor_base") @db.Decimal(10, 2)
  percentual              Decimal?     @db.Decimal(5, 2)
  valorComissao           Decimal      @map("valor_comissao") @db.Decimal(10, 2)
  dataReferencia          DateTime     @map("data_referencia") @db.Date
  status                  StatusComissao @default(pendente)
  dataPagamento           DateTime?    @map("data_pagamento") @db.Date
  createdAt               DateTime     @default(now()) @map("created_at")
  
  colaborador             Colaborador  @relation(fields: [colaboradorId], references: [id])
  venda                   Venda?       @relation(fields: [vendaId], references: [id])
  atendimentoServico      AtendimentoServico? @relation(fields: [atendimentoServicoId], references: [id])

  @@map("comissoes")
}

model TaxaMaquininha {
  id              Int          @id @default(autoincrement())
  bandeira        String       @db.VarChar(50)
  tipoTransacao   TipoTransacao @map("tipo_transacao")
  parcelas        Int          @default(1)
  taxaPercentual  Decimal      @map("taxa_percentual") @db.Decimal(5, 2)
  ativo           Boolean      @default(true)

  @@map("taxas_maquininha")
}

// ENUMS

enum Perfil {
  admin
  gerente
  atendente
  profissional
}

enum StatusCliente {
  ativo
  inativo
  prospecto
}

enum TipoColaborador {
  profissional
  administrativo
}

enum ComissaoTipo {
  percentual
  fixo
}

enum StatusAtendimento {
  agendado
  em_atendimento
  concluido
  cancelado
}

enum TipoVenda {
  servico
  pacote
  produto
}

enum FormaPagamento {
  dinheiro
  debito
  credito
  pix
  transferencia
}

enum StatusPagamento {
  pendente
  parcial
  pago
  cancelado
}

enum StatusParcela {
  pendente
  pago
  vencido
}

enum StatusDespesa {
  pendente
  pago
  vencido
  cancelado
}

enum StatusComissao {
  pendente
  pago
}

enum TipoTransacao {
  debito
  credito
}
```

## FUNCIONALIDADES DETALHADAS POR MÓDULO

### 1. MÓDULO DE AUTENTICAÇÃO

**Endpoints:**
- `POST /api/auth/login` - Login com email e senha
- `POST /api/auth/register` - Registro de novo usuário (apenas admin)
- `POST /api/auth/refresh` - Renovação de token JWT
- `POST /api/auth/logout` - Logout

**Regras de Negócio:**
- Senhas devem ter hash bcrypt (salt rounds: 10)
- Tokens JWT expiram em 1 hora
- Refresh tokens expiram em 7 dias
- Implementar rate limiting: máximo 5 tentativas de login por IP a cada 15 minutos
- Validar força da senha (mínimo 8 caracteres, letras e números)

**Guards e Decorators:**
- `@UseGuards(JwtAuthGuard)` - Protege rotas autenticadas
- `@UseGuards(RolesGuard)` - Controle de acesso por perfil
- `@Roles('admin', 'gerente')` - Decorator para especificar perfis permitidos

### 2. MÓDULO DE CLIENTES

**Endpoints:**
- `GET /api/clientes` - Listar clientes (paginado, com filtros)
- `GET /api/clientes/:id` - Buscar cliente específico
- `POST /api/clientes` - Criar novo cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Soft delete (muda status para inativo)
- `GET /api/clientes/:id/historico` - Histórico de atendimentos e vendas

**Validações:**
- Nome: obrigatório, 3-100 caracteres
- Telefone: obrigatório, formato brasileiro (11 dígitos)
- Email: formato válido (opcional)
- CPF: validar dígitos verificadores (opcional)
- Não permitir CPF duplicado

**Filtros e Busca:**
- Buscar por: nome, telefone, email, CPF
- Filtrar por: status (ativo/inativo/prospecto)
- Ordenar por: nome, data de cadastro, última visita
- Paginação: 20 itens por página (padrão)

### 3. MÓDULO DE ATENDIMENTOS

**Endpoints:**
- `GET /api/atendimentos` - Listar atendimentos
- `GET /api/atendimentos/agenda/:data` - Agenda do dia por profissional
- `POST /api/atendimentos` - Criar novo agendamento
- `PUT /api/atendimentos/:id` - Atualizar atendimento
- `PUT /api/atendimentos/:id/status` - Mudar status
- `PUT /api/atendimentos/:id/remanejar` - Remanejar para outro profissional
- `POST /api/atendimentos/:id/servicos` - Adicionar serviços ao atendimento
- `DELETE /api/atendimentos/:id/servicos/:servicoId` - Remover serviço

**Regras de Negócio:**
- Não permitir agendamento em horários já ocupados
- Calcular automaticamente horário de término baseado na duração dos serviços
- Ao concluir atendimento, atualizar última visita do cliente
- Validar que colaborador está ativo
- Permitir múltiplos serviços por atendimento
- Calcular valor total automaticamente

**Fluxo de Status:**
- agendado → em_atendimento → concluido
- Permitir cancelamento em qualquer status
- Ao concluir, gerar automaticamente a venda

### 4. MÓDULO FINANCEIRO

**Endpoints:**
- `GET /api/financeiro/fluxo-caixa` - Fluxo de caixa detalhado
- `GET /api/financeiro/dashboard` - Métricas para dashboard
- `GET /api/vendas` - Listar vendas
- `POST /api/vendas` - Registrar venda
- `PUT /api/vendas/:id` - Atualizar venda
- `GET /api/despesas` - Listar despesas
- `POST /api/despesas` - Lançar despesa
- `PUT /api/despesas/:id/pagar` - Registrar pagamento
- `GET /api/comissoes` - Listar comissões
- `PUT /api/comissoes/:id/pagar` - Pagar comissão

**Cálculos Automáticos:**
- Valor final da venda = valor total - desconto
- Se cartão de crédito, aplicar taxa da maquininha
- Calcular comissão por serviço (percentual ou fixo)
- Gerar parcelas automaticamente se venda parcelada
- Atualizar status de parcelas vencidas diariamente

**Dashboard Financeiro:**
- Receitas do mês atual
- Despesas do mês atual
- Saldo (receitas - despesas)
- Comparação com mês anterior (%)
- Despesas vencidas (alerta)
- Despesas a vencer nos próximos 7 dias
- Gráfico de evolução mensal (últimos 6 meses)

### 5. MÓDULO DE ADMINISTRAÇÃO

**Serviços:**
- CRUD completo de serviços
- Validar que nome é único
- Ao desativar, não permitir novos agendamentos

**Colaboradores:**
- CRUD completo de colaboradores
- Vincular com usuário do sistema (opcional)
- Calcular comissões automaticamente

**Pacotes:**
- CRUD completo de pacotes
- Gerenciar serviços inclusos no pacote
- Calcular economia (soma dos serviços - valor do pacote)

**Produtos:**
- CRUD completo de produtos
- Controle de estoque
- Alerta quando estoque < estoque mínimo

**Taxas de Maquininha:**
- CRUD completo
- Usar na venda para calcular valor líquido

## REQUISITOS NÃO-FUNCIONAIS

### Performance
- APIs devem responder em menos de 200ms (95% dos casos)
- Implementar índices no banco para queries frequentes
- Usar eager loading quando necessário (evitar N+1)
- Implementar cache com Redis para dados que mudam pouco

### Segurança
- CORS configurado para domínios específicos
- Rate limiting em todas as rotas públicas
- Sanitização de inputs
- Prepared statements (Prisma já faz)
- HTTPS obrigatório em produção
- Helmet.js para headers de segurança
- Logs de auditoria para ações sensíveis

### Escalabilidade
- Preparar para 1000 atendimentos/mês
- Suportar 50 usuários simultâneos
- Banco de dados com backup diário
- Possibilidade de sharding futuro

### Observabilidade
- Logs estruturados (Winston ou Pino)
- Monitoramento de erros (Sentry)
- Métricas de performance (New Relic ou similar)
- Health check endpoint: `GET /api/health`

## TESTES OBRIGATÓRIOS

### Backend
- **Unitários**: 70% de cobertura mínima
  - Todos os services
  - Validações de DTOs
  - Cálculos financeiros
  
- **Integração**: 50% de cobertura
  - Fluxos completos de APIs
  - Autenticação e autorização
  - Transações de banco

- **E2E**: Fluxos críticos
  - Login e autenticação
  - Criar atendimento completo
  - Processar venda
  - Calcular comissões

### Frontend
- **Componentes**: 60% de cobertura
  - Formulários
  - Tabelas
  - Modais
  
- **Hooks**: 70% de cobertura
  - useAuth
  - Hooks de requisições

## ENTREGÁVEIS POR SPRINT

### Sprint 1 (Setup - 2 semanas)
- [ ] Configuração de repositórios (monorepo ou multi-repo)
- [ ] Setup de Docker e Docker Compose
- [ ] Configuração do Prisma + migrations iniciais
- [ ] Setup do NestJS com estrutura de módulos
- [ ] Setup do React + Vite + TailwindCSS
- [ ] CI/CD básico (GitHub Actions)
- [ ] Documentação inicial (README)

### Sprint 2-3 (Autenticação e Base - 4 semanas)
- [ ] Sistema de autenticação completo (JWT)
- [ ] Guards e decorators de autorização
- [ ] CRUD de usuários
- [ ] CRUD de clientes
- [ ] CRUD de colaboradores
- [ ] CRUD de serviços
- [ ] Tela de login
- [ ] Layout base com sidebar
- [ ] Listagem de clientes com busca e filtros

### Sprint 4-5 (Atendimentos - 4 semanas)
- [ ] CRUD de atendimentos
- [ ] Agenda visual por profissional
- [ ] Sistema de remanejar atendimentos
- [ ] Adicionar/remover serviços
- [ ] Validação de conflitos de horário
- [ ] Dashboard de atendimentos
- [ ] Comandas de atendimento

### Sprint 6-7 (Financeiro - 4 semanas)
- [ ] Sistema de vendas completo
- [ ] Gestão de parcelas
- [ ] Sistema de despesas
- [ ] Cálculo de comissões
- [ ] Fluxo de caixa
- [ ] Dashboard financeiro com gráficos
- [ ] Relatórios básicos

### Sprint 8-9 (Features Avançadas - 4 semanas)
- [ ] Sistema de pacotes
- [ ] CRUD de produtos
- [ ] Controle de estoque
- [ ] Taxas de maquininha
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Notificações de despesas vencidas
- [ ] Backup automatizado

### Sprint 10 (Testes e Deploy - 2 semanas)
- [ ] Testes automatizados
- [ ] Correção de bugs
- [ ] Otimizações de performance
- [ ] Deploy em produção
- [ ] Documentação completa da API (Swagger)
- [ ] Manual do usuário

## PADRÕES DE CÓDIGO

### Backend (NestJS)
```typescript
// Controller - exemplo
@Controller('api/clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @Roles('admin', 'gerente', 'atendente')
  async findAll(@Query() query: ListClientesDto) {
    return this.clientesService.findAll(query);
  }

  @Post()
  @Roles('admin', 'gerente', 'atendente')
  async create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }
}

// Service - exemplo
@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ListClientesDto) {
    const { page = 1, limit = 20, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ClienteWhereInput = {};
    
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { telefone: { contains: search } },
      ];
    }
    
    if (status) {
      where.status = status as StatusCliente;
    }

    const [data, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }
}

// DTO - exemplo
export class CreateClienteDto {
  @IsString()
  @Length(3, 100)
  nome: string;

  @IsString()
  @Matches(/^\d{10,11}$/)
  telefone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @Matches(/^\d{11}$/)
  @IsOptional()
  cpf?: string;
}
```

### Frontend (React)
```typescript
// Page - exemplo
export function ListaClientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useClientes({ search: searchTerm });
  const createMutation = useCreateCliente();

  const handleCreate = (data: ClienteFormData) => {
    createMutation.mutate(data);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => setShowModal(true)}>
          Novo Cliente
        </Button>
      </div>

      <Input
        placeholder="Buscar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Table
        data={data?.data || []}
        columns={columns}
      />
    </div>
  );
}

// Hook - exemplo
export function useClientes(params?: ListClientesParams) {
  return useQuery({
    queryKey: ['clientes', params],
    queryFn: () => clientesService.getAll(params),
  });
}

// Service - exemplo
export const clientesService = {
  getAll: (params?: ListClientesParams) =>
    api.get('/clientes', { params }).then(res => res.data),
    
  create: (data: CreateClienteDto) =>
    api.post('/clientes', data).then(res => res.data),
    
  update: (id: number, data: UpdateClienteDto) =>
    api.put(`/clientes/${id}`, data).then(res => res.data),
};
```

## VARIÁVEIS DE AMBIENTE

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jsbeauty?schema=public"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="7d"

# App
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:5173"

# Redis (opcional)
REDIS_URL="redis://localhost:6379"

# Sentry (opcional)
SENTRY_DSN=""
```

### Frontend (.env)
```bash
VITE_API_URL="http://localhost:3000/api"
VITE_APP_NAME="JS Beauty Studio"
```

## CRITÉRIOS DE ACEITE

Cada funcionalidade deve atender:
- ✅ Código revisado (code review)
- ✅ Testes passando (min 70% cobertura backend)
- ✅ Documentação atualizada
- ✅ Sem warnings de TypeScript
- ✅ Sem vulnerabilidades críticas (npm audit)
- ✅ Performance dentro dos SLAs
- ✅ Acessível em todos os perfis de usuário permitidos
- ✅ Responsivo (mobile, tablet, desktop)

## COMANDOS ÚTEIS

### Desenvolvimento
```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npx prisma generate
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker-compose up -d
```

### Testes
```bash
# Backend
npm run test
npm run test:cov
npm run test:e2e

# Frontend
npm run test
npm run test:coverage
```

### Deploy
```bash
# Build
npm run build

# Migrations em produção
npx prisma migrate deploy
```

## OBSERVAÇÕES FINAIS

- Sempre use TypeScript - sem `any`
- Commits seguem Conventional Commits
- Branch strategy: Git Flow
- Code review obrigatório antes de merge
- Documentar decisões arquiteturais importantes
- Priorizar clareza sobre cleverness
- DRY, mas não exagerar na abstração prematura

---

**Este PRD deve ser seguido rigorosamente. Qualquer desvio deve ser documentado e justificado.**
