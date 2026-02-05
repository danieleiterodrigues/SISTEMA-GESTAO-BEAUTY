# PRD-PROMPT: Backend API - Sistema JS Beauty Studio

## CONTEXTO E OBJETIVO

Você é um desenvolvedor backend sênior responsável por criar a API REST completa do sistema de gestão JS Beauty Studio. A API deve implementar TODAS as regras de negócio especificadas, especialmente a lógica de **Previsão de Entrada de Valores** com quitações de serviços sociais e pacotes.

---

## REGRAS DE NEGÓCIO CRÍTICAS

### PREVISÃO DE ENTRADA DE VALORES

O salão trabalha com **dois tipos de quitações**:

#### 1. SERVIÇOS SOCIAIS (Madrinhas, Formandas, Damas)
**Regra**: Cliente faz entrada (sinal) e quita o restante **no dia do atendimento**

**Cálculo**:
```
Saldo Pendente = Valor Total do Atendimento - Valor Já Pago
```

**Filtro de Período**:
- Buscar atendimentos cuja `data_atendimento` está entre hoje e +X dias
- Somar os saldos pendentes de todos os atendimentos

**Exemplo**:
- Atendimento: Madrinha Maria, 25/01/2026
- Valor total: R$ 400
- Valor pago (entrada): R$ 100
- **Saldo a receber: R$ 300** (no dia 25/01)

#### 2. PACOTES (Noivas, Debutantes)
**Regra**: Pacote deve estar 100% quitado **até 10 dias ANTES da data do evento**

**Cálculo**:
```
Saldo Pendente = Valor Total do Pacote - Valor Já Pago
Data Limite Quitação = Data do Evento - 10 dias
```

**Filtro de Período**:
- Se período é "próximos 7 dias":
  - Buscar pacotes cujo evento acontece entre (hoje + 10 dias) e (hoje + 17 dias)
  - Por quê? Porque o prazo de quitação está dentro dos próximos 7 dias
- Se período é "próximos 15 dias":
  - Eventos entre (hoje + 10 dias) e (hoje + 25 dias)
- Se período é "próximos 30 dias":
  - Eventos entre (hoje + 10 dias) e (hoje + 40 dias)

**Exemplo**:
- Pacote: Noiva Ana, evento em 06/02/2026
- Prazo quitação: 27/01/2026 (10 dias antes)
- Valor total: R$ 5.000
- Valor pago: R$ 2.500
- **Saldo a receber: R$ 2.500** (até 27/01)

---

## STACK TECNOLÓGICA OBRIGATÓRIA

### Core
- **Runtime**: Node.js 18+ (LTS)
- **Framework**: Express.js 4+ ou Fastify 4+
- **Linguagem**: TypeScript 5+

### Banco de Dados
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5+ ou TypeORM
- **Migrations**: Prisma Migrate ou TypeORM Migrations

### Validação e Segurança
- **Validação**: Zod ou Joi
- **Autenticação**: JWT (jsonwebtoken)
- **Senha**: bcrypt
- **CORS**: cors middleware

### Utilitários
- **Datas**: date-fns
- **Logging**: Winston ou Pino
- **Env**: dotenv

---

## ESTRUTURA DO BANCO DE DADOS

### Tabela: usuarios
```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  perfil VARCHAR(50) NOT NULL CHECK (perfil IN ('admin', 'gerente', 'atendente', 'profissional')),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: clientes
```sql
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(15) NOT NULL,
  email VARCHAR(100),
  cpf VARCHAR(11) UNIQUE,
  data_nascimento DATE,
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(8),
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'prospecto')),
  ultima_visita TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: colaboradores
```sql
CREATE TABLE colaboradores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('profissional', 'administrativo')),
  telefone VARCHAR(15),
  email VARCHAR(100),
  cpf VARCHAR(11) UNIQUE,
  data_admissao DATE NOT NULL,
  comissao_padrao DECIMAL(5,2) CHECK (comissao_padrao >= 0 AND comissao_padrao <= 100),
  usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: servicos
```sql
CREATE TABLE servicos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50),
  duracao_minutos INTEGER NOT NULL CHECK (duracao_minutos > 0),
  valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
  comissao_tipo VARCHAR(20) CHECK (comissao_tipo IN ('percentual', 'fixo')),
  comissao_valor DECIMAL(10,2) CHECK (comissao_valor >= 0),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: atendimentos ⚠️ CRÍTICA
```sql
CREATE TABLE atendimentos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  colaborador_id INTEGER NOT NULL REFERENCES colaboradores(id) ON DELETE RESTRICT,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('servico_social', 'atendimento_comum')),
  data_atendimento DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  status VARCHAR(30) DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado')),
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (horario_fim > horario_inicio),
  CHECK (valor_pago <= valor_total)
);
```

### Tabela: atendimento_servicos
```sql
CREATE TABLE atendimento_servicos (
  id SERIAL PRIMARY KEY,
  atendimento_id INTEGER NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
  servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
  desconto DECIMAL(10,2) DEFAULT 0 CHECK (desconto >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: pacotes
```sql
CREATE TABLE pacotes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
  validade_dias INTEGER NOT NULL CHECK (validade_dias > 0),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: pacote_servicos
```sql
CREATE TABLE pacote_servicos (
  id SERIAL PRIMARY KEY,
  pacote_id INTEGER NOT NULL REFERENCES pacotes(id) ON DELETE CASCADE,
  servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  UNIQUE(pacote_id, servico_id)
);
```

### Tabela: pacote_vendas ⚠️ CRÍTICA
```sql
CREATE TABLE pacote_vendas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  pacote_id INTEGER NOT NULL REFERENCES pacotes(id) ON DELETE RESTRICT,
  data_venda DATE NOT NULL DEFAULT CURRENT_DATE,
  data_evento DATE NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total >= 0),
  valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (valor_pago >= 0),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'quitado', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (data_evento > data_venda),
  CHECK (valor_pago <= valor_total)
);
```

### Tabela: vendas
```sql
CREATE TABLE vendas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  atendimento_id INTEGER REFERENCES atendimentos(id) ON DELETE SET NULL,
  tipo_venda VARCHAR(30) NOT NULL CHECK (tipo_venda IN ('servico', 'pacote', 'produto')),
  data_venda TIMESTAMP NOT NULL DEFAULT NOW(),
  valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total >= 0),
  desconto DECIMAL(10,2) DEFAULT 0 CHECK (desconto >= 0),
  valor_final DECIMAL(10,2) NOT NULL CHECK (valor_final >= 0),
  forma_pagamento VARCHAR(30) NOT NULL,
  status_pagamento VARCHAR(30) DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'parcial', 'pago', 'cancelado')),
  parcelas INTEGER DEFAULT 1 CHECK (parcelas > 0),
  taxa_maquininha DECIMAL(5,2) DEFAULT 0 CHECK (taxa_maquininha >= 0),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: despesas
```sql
CREATE TABLE despesas (
  id SERIAL PRIMARY KEY,
  descricao VARCHAR(200) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status VARCHAR(30) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
  recorrente BOOLEAN DEFAULT FALSE,
  periodicidade VARCHAR(20) CHECK (periodicidade IN ('mensal', 'bimestral', 'trimestral', 'semestral', 'anual')),
  forma_pagamento VARCHAR(30),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ENDPOINT CRÍTICO: PREVISÃO DE ENTRADA

### GET /api/dashboard/previsao-entrada

**Query Parameters:**
```typescript
{
  periodo: '7d' | '15d' | '30d' | 'personalizado',
  dataInicio?: string, // YYYY-MM-DD (apenas se personalizado)
  dataFim?: string     // YYYY-MM-DD (apenas se personalizado)
}
```

**Response:**
```typescript
{
  periodo: string,
  dataInicio: string,
  dataFim: string,
  resumo: {
    servicosSociais: {
      valorTotal: number,
      quantidade: number
    },
    pacotes: {
      valorTotal: number,
      quantidade: number
    },
    total: {
      valorTotal: number,
      quantidade: number
    }
  },
  proximasQuitacoes: Array<{
    id: number,
    tipo: 'servico_social' | 'pacote',
    clienteNome: string,
    descricao: string,
    dataQuitacao: string, // YYYY-MM-DD
    valorTotal: number,
    valorPago: number,
    saldoPendente: number
  }>,
  alertas?: {
    quitacoesAtrasadas: number,
    valorAtrasado: number,
    pacotesVencendo: number,
    valorPacotesVencendo: number
  }
}
```

**Implementação (Prisma):**

```typescript
// src/controllers/dashboardController.ts
import { Request, Response } from 'express';
import { prisma } from '../database/prisma';
import { addDays, format } from 'date-fns';

export class DashboardController {
  async getPrevisaoEntrada(req: Request, res: Response) {
    const { periodo = '7d', dataInicio, dataFim } = req.query;
    
    // Calcular datas
    let startDate: Date;
    let endDate: Date;
    let eventStartDate: Date;
    let eventEndDate: Date;
    
    if (periodo === 'personalizado') {
      startDate = new Date(dataInicio as string);
      endDate = new Date(dataFim as string);
      eventStartDate = addDays(startDate, 10);
      eventEndDate = addDays(endDate, 10);
    } else {
      const days = parseInt(periodo);
      startDate = new Date();
      endDate = addDays(startDate, days);
      eventStartDate = addDays(startDate, 10);
      eventEndDate = addDays(endDate, 10);
    }
    
    // Query 1: SERVIÇOS SOCIAIS
    const servicosSociais = await prisma.atendimentos.findMany({
      where: {
        tipo: 'servico_social',
        data_atendimento: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['agendado', 'confirmado']
        },
        NOT: {
          valor_total: {
            equals: prisma.atendimentos.fields.valor_pago
          }
        }
      },
      include: {
        cliente: true
      }
    });
    
    const servicosSociaisData = servicosSociais.map(atend => ({
      id: atend.id,
      tipo: 'servico_social' as const,
      clienteNome: atend.cliente.nome,
      descricao: 'Serviço Social',
      dataQuitacao: format(atend.data_atendimento, 'yyyy-MM-dd'),
      valorTotal: atend.valor_total,
      valorPago: atend.valor_pago,
      saldoPendente: atend.valor_total - atend.valor_pago
    }));
    
    const totalServicosSociais = servicosSociaisData.reduce(
      (sum, item) => sum + item.saldoPendente, 
      0
    );
    
    // Query 2: PACOTES
    const pacotes = await prisma.pacote_vendas.findMany({
      where: {
        data_evento: {
          gte: eventStartDate,
          lte: eventEndDate
        },
        status: 'ativo',
        NOT: {
          valor_total: {
            equals: prisma.pacote_vendas.fields.valor_pago
          }
        }
      },
      include: {
        cliente: true,
        pacote: true
      }
    });
    
    const pacotesData = pacotes.map(pv => ({
      id: pv.id,
      tipo: 'pacote' as const,
      clienteNome: pv.cliente.nome,
      descricao: `Pacote ${pv.pacote.nome}`,
      dataQuitacao: format(addDays(pv.data_evento, -10), 'yyyy-MM-dd'),
      valorTotal: pv.valor_total,
      valorPago: pv.valor_pago,
      saldoPendente: pv.valor_total - pv.valor_pago
    }));
    
    const totalPacotes = pacotesData.reduce(
      (sum, item) => sum + item.saldoPendente,
      0
    );
    
    // Combinar e ordenar
    const proximasQuitacoes = [...servicosSociaisData, ...pacotesData]
      .sort((a, b) => a.dataQuitacao.localeCompare(b.dataQuitacao))
      .slice(0, 10);
    
    // Response
    return res.json({
      periodo,
      dataInicio: format(startDate, 'yyyy-MM-dd'),
      dataFim: format(endDate, 'yyyy-MM-dd'),
      resumo: {
        servicosSociais: {
          valorTotal: totalServicosSociais,
          quantidade: servicosSociaisData.length
        },
        pacotes: {
          valorTotal: totalPacotes,
          quantidade: pacotesData.length
        },
        total: {
          valorTotal: totalServicosSociais + totalPacotes,
          quantidade: servicosSociaisData.length + pacotesData.length
        }
      },
      proximasQuitacoes
    });
  }
}
```

**Query SQL Pura (Alternativa):**

```sql
-- SERVIÇOS SOCIAIS (Próximos 7 dias)
WITH servicos_sociais AS (
  SELECT 
    a.id,
    'servico_social' as tipo,
    c.nome as cliente_nome,
    'Serviço Social' as descricao,
    a.data_atendimento as data_quitacao,
    a.valor_total,
    a.valor_pago,
    (a.valor_total - a.valor_pago) as saldo_pendente
  FROM atendimentos a
  INNER JOIN clientes c ON c.id = a.cliente_id
  WHERE 
    a.tipo = 'servico_social'
    AND a.data_atendimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    AND a.status IN ('agendado', 'confirmado')
    AND (a.valor_total - a.valor_pago) > 0
),
pacotes AS (
  SELECT 
    pv.id,
    'pacote' as tipo,
    c.nome as cliente_nome,
    CONCAT('Pacote ', p.nome) as descricao,
    (pv.data_evento - INTERVAL '10 days')::date as data_quitacao,
    pv.valor_total,
    pv.valor_pago,
    (pv.valor_total - pv.valor_pago) as saldo_pendente
  FROM pacote_vendas pv
  INNER JOIN clientes c ON c.id = pv.cliente_id
  INNER JOIN pacotes p ON p.id = pv.pacote_id
  WHERE 
    pv.data_evento BETWEEN CURRENT_DATE + INTERVAL '10 days' 
                       AND CURRENT_DATE + INTERVAL '17 days'
    AND pv.status = 'ativo'
    AND (pv.valor_total - pv.valor_pago) > 0
),
todas_quitacoes AS (
  SELECT * FROM servicos_sociais
  UNION ALL
  SELECT * FROM pacotes
)
SELECT 
  -- Totalizadores
  (SELECT SUM(saldo_pendente) FROM servicos_sociais) as total_servicos,
  (SELECT COUNT(*) FROM servicos_sociais) as qtd_servicos,
  (SELECT SUM(saldo_pendente) FROM pacotes) as total_pacotes,
  (SELECT COUNT(*) FROM pacotes) as qtd_pacotes,
  (SELECT SUM(saldo_pendente) FROM todas_quitacoes) as total_geral,
  (SELECT COUNT(*) FROM todas_quitacoes) as qtd_geral
FROM todas_quitacoes
LIMIT 1;

-- Lista de próximas quitações
SELECT * 
FROM todas_quitacoes
ORDER BY data_quitacao ASC
LIMIT 10;
```

---

## OUTROS ENDPOINTS CRÍTICOS

### POST /api/atendimentos
```typescript
interface CreateAtendimentoDto {
  clienteId: number;
  colaboradorId: number;
  tipo: 'servico_social' | 'atendimento_comum';
  dataAtendimento: string; // YYYY-MM-DD
  horarioInicio: string; // HH:MM
  servicos: Array<{
    servicoId: number;
    quantidade: number;
  }>;
  valorPago?: number; // Entrada (opcional)
  observacoes?: string;
}
```

**Validações:**
- [ ] Cliente existe e está ativo
- [ ] Colaborador existe e está ativo
- [ ] Não há conflito de horário do colaborador
- [ ] Calcular `horarioFim` baseado na duração dos serviços
- [ ] Calcular `valorTotal` somando todos os serviços
- [ ] `valorPago` não pode ser maior que `valorTotal`

**Regras:**
1. Calcular duração total somando duração de cada serviço × quantidade
2. `horarioFim = horarioInicio + duracaoTotal`
3. Verificar se colaborador já tem outro atendimento no mesmo horário
4. Calcular valor total: `SUM(servico.valor × quantidade)`
5. Criar atendimento + atendimento_servicos em transação

### POST /api/pacote-vendas
```typescript
interface CreatePacoteVendaDto {
  clienteId: number;
  pacoteId: number;
  dataEvento: string; // YYYY-MM-DD
  valorPago?: number; // Entrada (opcional)
  observacoes?: string;
}
```

**Validações:**
- [ ] Cliente existe e está ativo
- [ ] Pacote existe e está ativo
- [ ] `dataEvento` está no futuro
- [ ] `dataEvento` está a pelo menos 10 dias no futuro
- [ ] `valorPago` ≤ `valorTotal` do pacote

**Regras:**
1. `valorTotal = pacote.valor`
2. `valorPago` é a entrada (opcional)
3. Status inicial: 'ativo'
4. Criar registro em `pacote_vendas`

### PUT /api/atendimentos/:id/registrar-pagamento
```typescript
interface RegistrarPagamentoDto {
  valor: number;
  formaPagamento: string;
}
```

**Validações:**
- [ ] Atendimento existe
- [ ] Status não é 'cancelado'
- [ ] `valorPago + valor ≤ valorTotal`

**Regras:**
1. Incrementar `valorPago`
2. Se `valorPago === valorTotal`: status do pagamento = 'quitado'
3. Registrar em tabela de pagamentos (histórico)
4. Se serviço social: registrar no dia do atendimento

---

## TRIGGERS E AUTOMAÇÕES

### Trigger: Atualizar status de quitação
```sql
CREATE OR REPLACE FUNCTION atualizar_status_quitacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Para atendimentos
  IF TG_TABLE_NAME = 'atendimentos' THEN
    IF NEW.valor_pago >= NEW.valor_total THEN
      UPDATE vendas 
      SET status_pagamento = 'pago'
      WHERE atendimento_id = NEW.id;
    END IF;
  END IF;
  
  -- Para pacotes
  IF TG_TABLE_NAME = 'pacote_vendas' THEN
    IF NEW.valor_pago >= NEW.valor_total THEN
      NEW.status := 'quitado';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_status_quitacao_atendimento
AFTER UPDATE OF valor_pago ON atendimentos
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_quitacao();

CREATE TRIGGER trigger_atualizar_status_quitacao_pacote
BEFORE UPDATE OF valor_pago ON pacote_vendas
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_quitacao();
```

### Trigger: Alertas de quitações vencidas
```sql
CREATE OR REPLACE FUNCTION verificar_quitacoes_vencidas()
RETURNS void AS $$
BEGIN
  -- Marcar atendimentos com quitação vencida
  UPDATE atendimentos
  SET observacoes = CONCAT(COALESCE(observacoes, ''), ' [QUITAÇÃO ATRASADA]')
  WHERE 
    data_atendimento < CURRENT_DATE
    AND (valor_total - valor_pago) > 0
    AND status = 'concluido'
    AND observacoes NOT LIKE '%QUITAÇÃO ATRASADA%';
    
  -- Marcar pacotes com quitação vencida (10 dias antes do evento)
  UPDATE pacote_vendas
  SET observacoes = CONCAT(COALESCE(observacoes, ''), ' [PRAZO QUITAÇÃO VENCIDO]')
  WHERE 
    (data_evento - INTERVAL '10 days')::date < CURRENT_DATE
    AND (valor_total - valor_pago) > 0
    AND status = 'ativo'
    AND observacoes NOT LIKE '%PRAZO QUITAÇÃO VENCIDO%';
END;
$$ LANGUAGE plpgsql;

-- Executar diariamente via cron job ou scheduler
```

---

## VALIDAÇÕES COM ZOD

```typescript
// src/validators/atendimento.validator.ts
import { z } from 'zod';

export const createAtendimentoSchema = z.object({
  clienteId: z.number().positive(),
  colaboradorId: z.number().positive(),
  tipo: z.enum(['servico_social', 'atendimento_comum']),
  dataAtendimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  horarioInicio: z.string().regex(/^\d{2}:\d{2}$/),
  servicos: z.array(z.object({
    servicoId: z.number().positive(),
    quantidade: z.number().positive().int()
  })).min(1, 'Pelo menos um serviço é obrigatório'),
  valorPago: z.number().nonnegative().optional(),
  observacoes: z.string().optional()
}).refine(data => {
  const date = new Date(data.dataAtendimento);
  return date >= new Date();
}, {
  message: 'Data do atendimento deve ser futura',
  path: ['dataAtendimento']
});

export const createPacoteVendaSchema = z.object({
  clienteId: z.number().positive(),
  pacoteId: z.number().positive(),
  dataEvento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  valorPago: z.number().nonnegative().optional(),
  observacoes: z.string().optional()
}).refine(data => {
  const eventDate = new Date(data.dataEvento);
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 10);
  return eventDate >= minDate;
}, {
  message: 'Data do evento deve ser pelo menos 10 dias no futuro',
  path: ['dataEvento']
});
```

---

## MIDDLEWARES

### Autenticação
```typescript
// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
```

### Validação
```typescript
// src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors 
      });
    }
  };
}
```

---

## ESTRUTURA DE PASTAS

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── clientesController.ts
│   │   ├── atendimentosController.ts
│   │   ├── pacotesController.ts
│   │   ├── dashboardController.ts
│   │   └── financeiro Controller.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── clientesService.ts
│   │   ├── atendimentosService.ts
│   │   └── dashboardService.ts
│   ├── repositories/
│   │   ├── clientesRepository.ts
│   │   ├── atendimentosRepository.ts
│   │   └── pacotesRepository.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── errorHandler.middleware.ts
│   ├── validators/
│   │   ├── cliente.validator.ts
│   │   ├── atendimento.validator.ts
│   │   └── pacote.validator.ts
│   ├── types/
│   │   ├── cliente.types.ts
│   │   ├── atendimento.types.ts
│   │   └── common.types.ts
│   ├── utils/
│   │   ├── dateUtils.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── database/
│   │   ├── prisma.ts
│   │   └── migrations/
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── clientes.routes.ts
│   │   ├── atendimentos.routes.ts
│   │   └── dashboard.routes.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env.example
├── package.json
└── tsconfig.json
```

---

## CRITÉRIOS DE ACEITE

### Funcional
- [ ] Endpoint de previsão retorna dados corretos
- [ ] Cálculo de quitações está correto
- [ ] Filtros de período funcionam
- [ ] Regra dos 10 dias está implementada
- [ ] Triggers atualizam status automaticamente
- [ ] Validações impedem dados inválidos

### Segurança
- [ ] JWT implementado corretamente
- [ ] Senhas hasheadas com bcrypt
- [ ] SQL injection prevenido (Prisma/TypeORM)
- [ ] CORS configurado
- [ ] Rate limiting implementado

### Performance
- [ ] Queries otimizadas (EXPLAIN ANALYZE)
- [ ] Índices nas colunas corretas
- [ ] Sem N+1 queries
- [ ] Response time < 200ms

### Qualidade
- [ ] 0 erros TypeScript
- [ ] Código documentado
- [ ] Testes unitários > 70%
- [ ] Testes integração endpoints críticos

---

**Este PRD é a fonte única de verdade para o backend do JS Beauty Studio.**
