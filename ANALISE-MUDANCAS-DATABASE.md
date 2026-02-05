# ANÁLISE: Mudanças Necessárias no PRD de Banco de Dados

## RESUMO EXECUTIVO

**SIM, MUDAM COISAS CRÍTICAS! 🔴**

O PRD de Banco de Dados atual **NÃO SUPORTA** a funcionalidade de "Previsão de Entrada de Valores" porque faltam:

1. ❌ Campos `valor_total` e `valor_pago` na tabela `atendimentos`
2. ❌ Campo `tipo` na tabela `atendimentos` (servico_social vs atendimento_comum)
3. ❌ Tabela `pacote_vendas` (venda/compra de pacotes por clientes)
4. ❌ Campo `data_evento` em pacotes (essencial para regra dos 10 dias)

**Sem essas mudanças, é IMPOSSÍVEL implementar a funcionalidade de quitações!**

---

## COMPARAÇÃO DETALHADA

### ❌ PROBLEMA 1: Tabela `atendimentos` INCOMPLETA

**PRD Atual (INSUFICIENTE):**
```sql
CREATE TABLE atendimentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    colaborador_id INTEGER NOT NULL,
    data_atendimento DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME,
    status status_atendimento NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

**PROBLEMAS:**
- ❌ Não tem `valor_total` → Não consegue calcular quanto a cliente deve
- ❌ Não tem `valor_pago` → Não consegue saber quanto já foi pago (entrada)
- ❌ Não tem `tipo` → Não consegue diferenciar serviço social de atendimento comum

**PRD CORRIGIDO (NECESSÁRIO):**
```sql
CREATE TABLE atendimentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    colaborador_id INTEGER NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('servico_social', 'atendimento_comum')), -- NOVO
    data_atendimento DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME,
    status status_atendimento NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,  -- NOVO
    valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0,   -- NOVO
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CHECK (valor_pago <= valor_total)  -- NOVO
);
```

**IMPACTO:** 
- ✅ Com isso: Consegue calcular `saldo_pendente = valor_total - valor_pago`
- ✅ Com isso: Consegue filtrar apenas `tipo = 'servico_social'`
- ❌ Sem isso: **FUNCIONALIDADE NÃO FUNCIONA!**

---

### ❌ PROBLEMA 2: Tabela `pacote_vendas` NÃO EXISTE

**PRD Atual:**
- ❌ Não existe tabela para registrar quando um cliente **COMPRA** um pacote
- ❌ A tabela `pacotes` é apenas o "catálogo" (modelo do pacote)
- ❌ Não tem como saber se cliente comprou pacote noiva
- ❌ Não tem campo `data_evento` (essencial para regra dos 10 dias)

**PRD CORRIGIDO (NECESSÁRIO CRIAR TABELA NOVA):**
```sql
CREATE TABLE pacote_vendas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    pacote_id INTEGER NOT NULL,
    data_venda DATE NOT NULL DEFAULT CURRENT_DATE,
    data_evento DATE NOT NULL,  -- 🔥 CAMPO CRÍTICO! Data do casamento/festa
    valor_total DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0,  -- Entrada + parcelas pagas
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'quitado', 'cancelado')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_pacote_vendas_cliente FOREIGN KEY (cliente_id) 
        REFERENCES clientes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pacote_vendas_pacote FOREIGN KEY (pacote_id) 
        REFERENCES pacotes(id) ON DELETE RESTRICT,
    CHECK (data_evento > data_venda),
    CHECK (valor_pago <= valor_total)
);

COMMENT ON TABLE pacote_vendas IS 'Registro de compra de pacotes por clientes (noivas, debutantes)';
COMMENT ON COLUMN pacote_vendas.data_evento IS 'Data do evento (casamento, festa) - usado para calcular prazo de quitação (10 dias antes)';
```

**IMPACTO:**
- ✅ Com isso: Consegue calcular `prazo_quitacao = data_evento - 10 dias`
- ✅ Com isso: Consegue saber quanto cliente ainda deve do pacote
- ✅ Com isso: Consegue filtrar pacotes que vencem nos próximos X dias
- ❌ Sem isso: **FUNCIONALIDADE NÃO FUNCIONA!**

---

## MUDANÇAS NECESSÁRIAS (CHECKLIST)

### 1️⃣ ALTERAR: Tabela `atendimentos`
```sql
-- Adicionar colunas
ALTER TABLE atendimentos 
ADD COLUMN tipo VARCHAR(30) NOT NULL DEFAULT 'atendimento_comum' 
    CHECK (tipo IN ('servico_social', 'atendimento_comum'));

ALTER TABLE atendimentos 
ADD COLUMN valor_total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0);

ALTER TABLE atendimentos 
ADD COLUMN valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (valor_pago >= 0);

ALTER TABLE atendimentos 
ADD CONSTRAINT chk_atendimentos_valor_pago CHECK (valor_pago <= valor_total);

-- Adicionar índices para performance
CREATE INDEX idx_atendimentos_tipo ON atendimentos(tipo);
CREATE INDEX idx_atendimentos_data_tipo ON atendimentos(data_atendimento, tipo);
CREATE INDEX idx_atendimentos_valor_pendente ON atendimentos((valor_total - valor_pago)) 
    WHERE (valor_total - valor_pago) > 0;
```

### 2️⃣ CRIAR: Tabela `pacote_vendas`
```sql
CREATE TABLE pacote_vendas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    pacote_id INTEGER NOT NULL,
    data_venda DATE NOT NULL DEFAULT CURRENT_DATE,
    data_evento DATE NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'quitado', 'cancelado')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_pacote_vendas_cliente FOREIGN KEY (cliente_id) 
        REFERENCES clientes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pacote_vendas_pacote FOREIGN KEY (pacote_id) 
        REFERENCES pacotes(id) ON DELETE RESTRICT,
    CONSTRAINT chk_pacote_vendas_data CHECK (data_evento > data_venda),
    CONSTRAINT chk_pacote_vendas_valor_total CHECK (valor_total >= 0),
    CONSTRAINT chk_pacote_vendas_valor_pago CHECK (valor_pago >= 0),
    CONSTRAINT chk_pacote_vendas_valores CHECK (valor_pago <= valor_total)
);

-- Índices para performance nas queries de previsão
CREATE INDEX idx_pacote_vendas_data_evento ON pacote_vendas(data_evento);
CREATE INDEX idx_pacote_vendas_status ON pacote_vendas(status);
CREATE INDEX idx_pacote_vendas_cliente ON pacote_vendas(cliente_id);
CREATE INDEX idx_pacote_vendas_valor_pendente ON pacote_vendas((valor_total - valor_pago)) 
    WHERE status = 'ativo' AND (valor_total - valor_pago) > 0;

COMMENT ON TABLE pacote_vendas IS 'Vendas de pacotes para noivas e debutantes';
COMMENT ON COLUMN pacote_vendas.data_evento IS 'Data do evento - pacote deve estar quitado 10 dias antes';
```

### 3️⃣ CRIAR: Trigger de Atualização Automática
```sql
-- Trigger para atualizar status quando quitado
CREATE OR REPLACE FUNCTION atualizar_status_quitacao_pacote()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.valor_pago >= NEW.valor_total THEN
        NEW.status := 'quitado';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_status_quitacao_pacote
BEFORE UPDATE OF valor_pago ON pacote_vendas
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_quitacao_pacote();
```

### 4️⃣ CRIAR: View de Previsão (Opcional, para facilitar queries)
```sql
CREATE VIEW view_previsao_quitacoes AS
-- Serviços Sociais
SELECT 
    a.id,
    'servico_social' as tipo,
    c.nome as cliente_nome,
    'Serviço Social' as descricao,
    a.data_atendimento as data_quitacao,
    a.valor_total,
    a.valor_pago,
    (a.valor_total - a.valor_pago) as saldo_pendente,
    a.created_at
FROM atendimentos a
INNER JOIN clientes c ON c.id = a.cliente_id
WHERE 
    a.tipo = 'servico_social'
    AND a.status IN ('agendado', 'confirmado')
    AND (a.valor_total - a.valor_pago) > 0

UNION ALL

-- Pacotes
SELECT 
    pv.id,
    'pacote' as tipo,
    c.nome as cliente_nome,
    CONCAT('Pacote ', p.nome) as descricao,
    (pv.data_evento - INTERVAL '10 days')::date as data_quitacao,
    pv.valor_total,
    pv.valor_pago,
    (pv.valor_total - pv.valor_pago) as saldo_pendente,
    pv.created_at
FROM pacote_vendas pv
INNER JOIN clientes c ON c.id = pv.cliente_id
INNER JOIN pacotes p ON p.id = pv.pacote_id
WHERE 
    pv.status = 'ativo'
    AND (pv.valor_total - pv.valor_pago) > 0;

COMMENT ON VIEW view_previsao_quitacoes IS 'View consolidada de todas as quitações pendentes';
```

---

## SCRIPT DE MIGRAÇÃO COMPLETO

```sql
-- ============================================================================
-- MIGRATION: Adicionar suporte para Previsão de Entrada de Valores
-- Data: 2026-01-21
-- Descrição: Adiciona campos necessários para rastrear quitações de 
--            serviços sociais e pacotes de noivas/debutantes
-- ============================================================================

BEGIN;

-- Passo 1: Adicionar colunas em atendimentos
ALTER TABLE atendimentos 
ADD COLUMN tipo VARCHAR(30) NOT NULL DEFAULT 'atendimento_comum' 
    CHECK (tipo IN ('servico_social', 'atendimento_comum'));

ALTER TABLE atendimentos 
ADD COLUMN valor_total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0);

ALTER TABLE atendimentos 
ADD COLUMN valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (valor_pago >= 0);

ALTER TABLE atendimentos 
ADD CONSTRAINT chk_atendimentos_valor_pago CHECK (valor_pago <= valor_total);

COMMENT ON COLUMN atendimentos.tipo IS 'servico_social: eventos (madrinha, formanda) | atendimento_comum: atendimento regular';
COMMENT ON COLUMN atendimentos.valor_total IS 'Valor total do atendimento (soma de todos os serviços)';
COMMENT ON COLUMN atendimentos.valor_pago IS 'Valor já pago (entrada/adiantamento)';

-- Passo 2: Criar tabela pacote_vendas
CREATE TABLE pacote_vendas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    pacote_id INTEGER NOT NULL,
    data_venda DATE NOT NULL DEFAULT CURRENT_DATE,
    data_evento DATE NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'quitado', 'cancelado')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_pacote_vendas_cliente FOREIGN KEY (cliente_id) 
        REFERENCES clientes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pacote_vendas_pacote FOREIGN KEY (pacote_id) 
        REFERENCES pacotes(id) ON DELETE RESTRICT,
    CONSTRAINT chk_pacote_vendas_data CHECK (data_evento > data_venda),
    CONSTRAINT chk_pacote_vendas_valor_total CHECK (valor_total >= 0),
    CONSTRAINT chk_pacote_vendas_valor_pago CHECK (valor_pago >= 0),
    CONSTRAINT chk_pacote_vendas_valores CHECK (valor_pago <= valor_total)
);

COMMENT ON TABLE pacote_vendas IS 'Vendas de pacotes (noivas, debutantes) - CRÍTICO para previsão de entrada';
COMMENT ON COLUMN pacote_vendas.data_evento IS 'Data do evento - pacote deve estar quitado 10 dias antes desta data';

-- Passo 3: Criar índices
CREATE INDEX idx_atendimentos_tipo ON atendimentos(tipo);
CREATE INDEX idx_atendimentos_data_tipo ON atendimentos(data_atendimento, tipo);
CREATE INDEX idx_atendimentos_valor_pendente ON atendimentos((valor_total - valor_pago)) 
    WHERE (valor_total - valor_pago) > 0;

CREATE INDEX idx_pacote_vendas_data_evento ON pacote_vendas(data_evento);
CREATE INDEX idx_pacote_vendas_status ON pacote_vendas(status);
CREATE INDEX idx_pacote_vendas_cliente ON pacote_vendas(cliente_id);
CREATE INDEX idx_pacote_vendas_valor_pendente ON pacote_vendas((valor_total - valor_pago)) 
    WHERE status = 'ativo' AND (valor_total - valor_pago) > 0;

-- Passo 4: Criar trigger
CREATE OR REPLACE FUNCTION atualizar_status_quitacao_pacote()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.valor_pago >= NEW.valor_total THEN
        NEW.status := 'quitado';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_status_quitacao_pacote
BEFORE UPDATE OF valor_pago ON pacote_vendas
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_quitacao_pacote();

-- Passo 5: Criar view consolidada
CREATE VIEW view_previsao_quitacoes AS
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
    AND a.status IN ('agendado', 'confirmado')
    AND (a.valor_total - a.valor_pago) > 0
UNION ALL
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
    pv.status = 'ativo'
    AND (pv.valor_total - pv.valor_pago) > 0;

COMMIT;

-- Validação
SELECT 'Migration aplicada com sucesso!' as status;
```

---

## DADOS DE TESTE

```sql
-- Inserir dados de teste para validar funcionalidade

-- Cliente 1: Madrinha
INSERT INTO clientes (nome, telefone, status) 
VALUES ('Maria Silva', '11987654321', 'ativo');

-- Cliente 2: Noiva
INSERT INTO clientes (nome, telefone, status) 
VALUES ('Ana Costa', '11976543210', 'ativo');

-- Atendimento: Serviço Social (Madrinha)
INSERT INTO atendimentos (
    cliente_id, 
    colaborador_id, 
    tipo, 
    data_atendimento, 
    horario_inicio, 
    horario_fim, 
    status, 
    valor_total, 
    valor_pago
) VALUES (
    1,  -- Maria Silva
    1,  -- Algum colaborador
    'servico_social',
    CURRENT_DATE + INTERVAL '5 days',  -- Daqui a 5 dias
    '14:00',
    '16:00',
    'agendado',
    400.00,  -- Valor total
    100.00   -- Entrada paga
);
-- Saldo pendente: R$ 300,00 (quitar no dia 5)

-- Venda de Pacote: Noiva
INSERT INTO pacote_vendas (
    cliente_id,
    pacote_id,
    data_venda,
    data_evento,
    valor_total,
    valor_pago,
    status
) VALUES (
    2,  -- Ana Costa
    1,  -- Pacote Noiva Premium
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '20 days',  -- Evento daqui a 20 dias
    5000.00,  -- Valor total do pacote
    2500.00,  -- Já pagou metade
    'ativo'
);
-- Saldo pendente: R$ 2.500,00 (quitar até 10 dias antes do evento = daqui a 10 dias)

-- Validar query de previsão
SELECT 
    tipo,
    cliente_nome,
    descricao,
    data_quitacao,
    valor_total,
    valor_pago,
    saldo_pendente
FROM view_previsao_quitacoes
WHERE data_quitacao BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '15 days'
ORDER BY data_quitacao;

-- Resultado esperado:
-- tipo             | cliente_nome | descricao          | data_quitacao | saldo_pendente
-- servico_social   | Maria Silva  | Serviço Social     | +5 dias       | 300.00
-- pacote           | Ana Costa    | Pacote Noiva Prem. | +10 dias      | 2500.00
```

---

## CONCLUSÃO

### ⚠️ MUDANÇAS CRÍTICAS NECESSÁRIAS:

1. ✅ **Alterar `atendimentos`**: Adicionar `tipo`, `valor_total`, `valor_pago`
2. ✅ **Criar `pacote_vendas`**: Tabela completamente nova com `data_evento`
3. ✅ **Criar índices**: Para performance das queries
4. ✅ **Criar triggers**: Para automatizar status
5. ✅ **Criar view**: Para facilitar consultas

### 📊 IMPACTO:

**SEM estas mudanças:**
- ❌ API não consegue calcular saldo pendente
- ❌ Dashboard não consegue mostrar previsão de entrada
- ❌ Sistema não funciona como esperado

**COM estas mudanças:**
- ✅ API consegue calcular tudo corretamente
- ✅ Dashboard mostra dados reais
- ✅ Sistema completo e funcional

### 🚀 PRÓXIMOS PASSOS:

1. **Aplicar migration** no banco de dados
2. **Validar** com dados de teste
3. **Atualizar PRD de Banco** com estas mudanças
4. **Implementar endpoints** da API
5. **Implementar frontend** do dashboard

---

**RESPOSTA DIRETA:** 

# SIM, MUDA MUITO! 🔴

O PRD de banco atual **NÃO ESTÁ PRONTO** para a funcionalidade de Previsão de Entrada. São necessárias **mudanças críticas** na estrutura do banco de dados.
