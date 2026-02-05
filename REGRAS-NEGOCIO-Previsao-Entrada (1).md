# REGRAS DE NEGÓCIO: Previsão de Entrada de Valores

## CONTEXTO DO NEGÓCIO

O JS Beauty Studio trabalha com dois tipos principais de clientes com formas diferentes de pagamento:

### 1. CLIENTES DE EVENTOS SOCIAIS
**Quem são**: Madrinhas, damas, formandas, convidados de eventos
**Como funciona o pagamento**:
- Cliente faz uma **entrada** (sinal/adiantamento) ao agendar
- O **saldo restante** deve ser quitado **no dia do atendimento**
- Exemplo: Serviço de R$ 400, entrada de R$ 100 → **R$ 300 a receber no dia**

**Prazo**: Quitação acontece na data do atendimento

### 2. CLIENTES DE PACOTES (NOIVAS/DEBUTANTES)
**Quem são**: Noivas, debutantes (eventos de longa data)
**Como funciona o pagamento**:
- Cliente compra um **pacote** com vários serviços inclusos
- Pode parcelar o valor do pacote
- **Regra crítica**: Pacote deve estar **100% quitado até 10 dias antes da data do evento**

**Prazo**: Quitação até 10 dias antes do evento

---

## LÓGICA DA SEÇÃO "PREVISÃO DE ENTRADA DE VALORES"

Esta seção mostra **quanto dinheiro o salão vai receber** em um período específico (7, 15, 30 dias ou data personalizada).

### CÁLCULO: SERVIÇOS SOCIAIS

**Consulta no banco:**
```sql
SELECT 
  SUM(atendimento.valor_total - atendimento.valor_pago) as saldo_pendente,
  COUNT(DISTINCT atendimento.id) as quantidade_quitacoes
FROM atendimentos
WHERE 
  atendimento.data_atendimento BETWEEN CURDATE() AND CURDATE() + INTERVAL X DAY
  AND atendimento.status IN ('agendado', 'confirmado')
  AND atendimento.tipo = 'servico_social'
  AND (atendimento.valor_total - atendimento.valor_pago) > 0
```

**Lógica**:
- Buscar todos os atendimentos nos próximos X dias
- Calcular: `valor_total - valor_já_pago = saldo_a_receber`
- Somar todos os saldos pendentes

**Exemplo**:
- Madrinha Maria: Serviço R$ 400, já pagou R$ 100 → **R$ 300 pendente**
- Formanda Ana: Serviço R$ 280, já pagou R$ 100 → **R$ 180 pendente**
- **Total**: R$ 480,00 (2 quitações)

### CÁLCULO: PACOTES (NOIVAS/DEBUTS)

**Consulta no banco:**
```sql
SELECT 
  SUM(pacote_venda.valor_total - pacote_venda.valor_pago) as saldo_pendente,
  COUNT(DISTINCT pacote_venda.id) as quantidade_quitacoes
FROM pacote_vendas
WHERE 
  pacote_venda.data_evento BETWEEN CURDATE() + INTERVAL 10 DAY 
                            AND CURDATE() + INTERVAL (X + 10) DAY
  AND pacote_venda.status != 'cancelado'
  AND (pacote_venda.valor_total - pacote_venda.valor_pago) > 0
```

**Lógica**:
- Buscar pacotes cujo **evento acontece entre (hoje + 10 dias) e (hoje + X + 10 dias)**
- Por quê? Porque o pacote deve estar quitado 10 dias antes do evento
- Calcular: `valor_total - valor_já_pago = saldo_a_receber`
- Somar todos os saldos pendentes

**Exemplo**:
- Noiva Julia: Evento em 20 dias, pacote R$ 5.000, já pagou R$ 2.500 → **R$ 2.500 pendente** (prazo: em 10 dias)
- Debutante Maria: Evento em 25 dias, pacote R$ 3.500, já pagou R$ 1.500 → **R$ 2.000 pendente** (prazo: em 15 dias)
- **Total**: R$ 4.500,00 (2 quitações)

### CÁLCULO: TOTAL PREVISTO

Simples: **Serviços Sociais + Pacotes**

---

## ESTRUTURA DE DADOS NECESSÁRIA

### Tabela: atendimentos
```sql
CREATE TABLE atendimentos (
  id INT PRIMARY KEY,
  cliente_id INT,
  tipo ENUM('servico_social', 'atendimento_comum'),
  data_atendimento DATE,
  valor_total DECIMAL(10,2),
  valor_pago DECIMAL(10,2) DEFAULT 0,  -- Entrada/adiantamento
  status ENUM('agendado', 'confirmado', 'concluido', 'cancelado'),
  created_at TIMESTAMP
);
```

### Tabela: pacote_vendas
```sql
CREATE TABLE pacote_vendas (
  id INT PRIMARY KEY,
  cliente_id INT,
  pacote_id INT,
  data_evento DATE,           -- Data do evento (casamento, festa)
  valor_total DECIMAL(10,2),
  valor_pago DECIMAL(10,2) DEFAULT 0,
  status ENUM('ativo', 'quitado', 'cancelado'),
  created_at TIMESTAMP
);
```

### Tabela: pagamentos (opcional, para histórico)
```sql
CREATE TABLE pagamentos (
  id INT PRIMARY KEY,
  referencia_tipo ENUM('atendimento', 'pacote'),
  referencia_id INT,
  valor DECIMAL(10,2),
  forma_pagamento VARCHAR(50),
  data_pagamento TIMESTAMP
);
```

---

## INTERFACE DO USUÁRIO

### Cards de Métricas (3 cards)

**Card 1: SERVIÇOS SOCIAIS (Rosa #E91E63)**
```
┌─────────────────────────┐
│ 🔴 SERVIÇOS SOCIAIS    │
│                         │
│   R$ 13.400,00         │
│                         │
│   8 quitações a receber │
└─────────────────────────┘
```

**Card 2: PACOTES (NOIVAS/DEBUTS) (Azul #3B4A5C)**
```
┌──────────────────────────────┐
│ 🔵 PACOTES (NOIVAS/DEBUTS)  │
│                              │
│   R$ 11.700,00              │
│                              │
│   5 pacotes a quitar        │
└──────────────────────────────┘
```

**Card 3: TOTAL PREVISTO (Verde #10B981)**
```
┌─────────────────────────────┐
│ 🟢 TOTAL PREVISTO          │
│                             │
│   R$ 25.100,00             │
│                             │
│   13 quitações no período  │
└─────────────────────────────┘
```

### Lista de Próximas Quitações

Abaixo dos 3 cards, mostrar lista com as próximas quitações:

```
Próximas Quitações                      Ver todas →

━ Maria Silva (Madrinha)           R$ 300,00
  Serviço Social • 25/01           de R$ 400,00

━ Ana Costa                        R$ 2.500,00
  Pacote Noiva • 27/01            de R$ 5.000,00

━ Julia Santos (Formanda)          R$ 180,00
  Serviço Social • 28/01           de R$ 280,00
```

### Filtro de Período

```
[Próximos 7 dias ▼]  [⬇]
```

Opções:
- Próximos 7 dias
- Próximos 15 dias
- Próximos 30 dias
- Data personalizada (abre datepicker com data início e fim)

---

## ALERTAS E NOTIFICAÇÕES

### Alertas Críticos

**1. Pacote vencendo (5 dias antes do prazo)**
```
⚠️  Atenção! Pacote de Ana Costa vence em 5 dias
    Saldo pendente: R$ 2.500,00
    [Notificar Cliente] [Ver Detalhes]
```

**2. Quitação atrasada (passou da data)**
```
🔴  Quitação atrasada! Maria Silva não quitou no dia do atendimento
    Valor pendente: R$ 300,00
    Atendimento: 20/01/2026
    [Contactar Cliente] [Registrar Pagamento]
```

### Dashboard de Alertas (Card adicional opcional)

```
┌────────────────────────────┐
│ Alertas Financeiros        │
├────────────────────────────┤
│ 🔴 2 quitações atrasadas   │
│    R$ 580,00               │
│                            │
│ ⚠️  3 pacotes vencendo     │
│    R$ 8.200,00             │
│                            │
│ [Ver Todos os Alertas]     │
└────────────────────────────┘
```

---

## QUERIES SQL COMPLETAS

### Query 1: Serviços Sociais (Próximos 7 dias)
```sql
SELECT 
  a.id,
  c.nome as cliente_nome,
  a.data_atendimento,
  a.valor_total,
  a.valor_pago,
  (a.valor_total - a.valor_pago) as saldo_pendente,
  CONCAT(
    CASE 
      WHEN a.observacoes LIKE '%madrinha%' THEN 'Madrinha'
      WHEN a.observacoes LIKE '%formanda%' THEN 'Formanda'
      WHEN a.observacoes LIKE '%dama%' THEN 'Dama'
      ELSE 'Evento Social'
    END
  ) as tipo_evento
FROM atendimentos a
INNER JOIN clientes c ON c.id = a.cliente_id
WHERE 
  a.data_atendimento BETWEEN CURDATE() AND CURDATE() + INTERVAL 7 DAY
  AND a.tipo = 'servico_social'
  AND a.status IN ('agendado', 'confirmado')
  AND (a.valor_total - a.valor_pago) > 0
ORDER BY a.data_atendimento ASC;
```

### Query 2: Pacotes (Eventos entre 10 e 17 dias)
```sql
SELECT 
  pv.id,
  c.nome as cliente_nome,
  p.nome as pacote_nome,
  pv.data_evento,
  pv.valor_total,
  pv.valor_pago,
  (pv.valor_total - pv.valor_pago) as saldo_pendente,
  DATEDIFF(pv.data_evento, CURDATE()) as dias_ate_evento,
  DATE_SUB(pv.data_evento, INTERVAL 10 DAY) as prazo_quitacao
FROM pacote_vendas pv
INNER JOIN clientes c ON c.id = pv.cliente_id
INNER JOIN pacotes p ON p.id = pv.pacote_id
WHERE 
  pv.data_evento BETWEEN CURDATE() + INTERVAL 10 DAY 
                     AND CURDATE() + INTERVAL 17 DAY
  AND pv.status = 'ativo'
  AND (pv.valor_total - pv.valor_pago) > 0
ORDER BY pv.data_evento ASC;
```

### Query 3: Totalizador
```sql
SELECT 
  SUM(servicos.saldo) as servicos_sociais,
  (SELECT SUM(p.saldo) FROM pacotes_query p) as pacotes,
  SUM(servicos.saldo) + (SELECT SUM(p.saldo) FROM pacotes_query p) as total,
  COUNT(servicos.id) + (SELECT COUNT(p.id) FROM pacotes_query p) as total_quitacoes
FROM servicos_query servicos;
```

---

## ENDPOINT DA API

### GET /api/dashboard/previsao-entrada

**Parâmetros:**
- `periodo`: '7d' | '15d' | '30d' | 'personalizado'
- `data_inicio`: (apenas se personalizado) '2026-01-20'
- `data_fim`: (apenas se personalizado) '2026-02-20'

**Response:**
```json
{
  "periodo": "7d",
  "data_inicio": "2026-01-20",
  "data_fim": "2026-01-27",
  "resumo": {
    "servicos_sociais": {
      "valor_total": 13400.00,
      "quantidade": 8
    },
    "pacotes": {
      "valor_total": 11700.00,
      "quantidade": 5
    },
    "total": {
      "valor_total": 25100.00,
      "quantidade": 13
    }
  },
  "proximas_quitacoes": [
    {
      "id": 123,
      "tipo": "servico_social",
      "cliente_nome": "Maria Silva (Madrinha)",
      "data_quitacao": "2026-01-25",
      "valor_total": 400.00,
      "valor_pago": 100.00,
      "saldo_pendente": 300.00
    },
    {
      "id": 456,
      "tipo": "pacote",
      "cliente_nome": "Ana Costa",
      "pacote_nome": "Pacote Noiva Premium",
      "data_evento": "2026-02-06",
      "prazo_quitacao": "2026-01-27",
      "valor_total": 5000.00,
      "valor_pago": 2500.00,
      "saldo_pendente": 2500.00
    }
  ],
  "alertas": {
    "quitacoes_atrasadas": 2,
    "valor_atrasado": 580.00,
    "pacotes_vencendo": 3,
    "valor_pacotes_vencendo": 8200.00
  }
}
```

---

## IMPLEMENTAÇÃO FRONTEND (React Query)

```typescript
// hooks/usePrevisaoEntrada.ts
import { useQuery } from '@tanstack/react-query';

interface PrevisaoEntradaParams {
  periodo: '7d' | '15d' | '30d' | 'personalizado';
  dataInicio?: string;
  dataFim?: string;
}

export function usePrevisaoEntrada(params: PrevisaoEntradaParams) {
  return useQuery({
    queryKey: ['previsao-entrada', params],
    queryFn: () => dashboardService.getPrevisaoEntrada(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60 * 5, // Auto-refresh
  });
}

// Uso no componente
const { data, isLoading } = usePrevisaoEntrada({ periodo: '7d' });

// Renderizar
<PrevisaoEntradaCard
  servicosSociais={data?.resumo.servicos_sociais}
  pacotes={data?.resumo.pacotes}
  total={data?.resumo.total}
  proximasQuitacoes={data?.proximas_quitacoes}
  alertas={data?.alertas}
/>
```

---

**Este documento deve ser usado como referência para implementação correta da funcionalidade.**
