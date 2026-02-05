-- ============================================================================
-- SCRIPT DE TESTE: Previsão de Entrada de Valores
-- Descrição: Insere dados de teste para validar a API de previsão financeira.
--            Garante que existam colaboradores e pacotes antes de inserir vendas.
-- ============================================================================

-- 1. Garantir existência de dependências (Colaborador e Pacote)
DO $$
BEGIN
    -- Inserir Colaborador se não existir
    IF NOT EXISTS (SELECT 1 FROM colaboradores) THEN
        INSERT INTO colaboradores (nome, tipo, ativo, created_at)
        VALUES ('Colaborador Teste', 'profissional', true, NOW());
    END IF;

    -- Inserir Pacote se não existir
    IF NOT EXISTS (SELECT 1 FROM pacotes) THEN
        INSERT INTO pacotes (nome, valor, ativo, created_at)
        VALUES ('Pacote Noiva Premium', 5000.00, true, NOW());
    END IF;
END $$;

-- 2. Limpar dados anteriores de teste (Opcional - Comentado por segurança)
-- DELETE FROM pacote_vendas WHERE cliente_id IN (SELECT id FROM clientes WHERE nome IN ('Maria Silva', 'Ana Costa'));
-- DELETE FROM atendimentos WHERE cliente_id IN (SELECT id FROM clientes WHERE nome IN ('Maria Silva', 'Ana Costa'));
-- DELETE FROM clientes WHERE nome IN ('Maria Silva', 'Ana Costa');

-- 3. Inserir Clientes de Teste
-- Cliente 1: Madrinha
INSERT INTO clientes (nome, telefone, status, "updatedAt", "createdAt") 
VALUES ('Maria Silva', '11987654321', 'ativo', NOW(), NOW())
ON CONFLICT DO NOTHING; -- Evita erro se rodar 2x (assumes no unique constraint on name, but just in case)
-- Note: schema doesn't have unique on nome, but has on cpf/email. Here we match by name later.

-- Cliente 2: Noiva
INSERT INTO clientes (nome, telefone, status, "updatedAt", "createdAt") 
VALUES ('Ana Costa', '11976543210', 'ativo', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 4. Inserir Atendimento (Serviço Social)
-- Madrinha Maria: Serviço de 400, pagou 100. Saldo 300. Data = Daqui a 5 dias.
INSERT INTO atendimentos (
    cliente_id, 
    colaborador_id, 
    tipo, 
    data_atendimento, 
    horario_inicio, 
    horario_fim, 
    status, 
    valor_total, 
    valor_pago,
    "updatedAt", "createdAt"
) VALUES (
    (SELECT id FROM clientes WHERE nome = 'Maria Silva' LIMIT 1),
    (SELECT id FROM colaboradores LIMIT 1),
    'servico_social',
    CURRENT_DATE + INTERVAL '5 days',
    '14:00',
    '16:00',
    'agendado',
    400.00,
    100.00,
    NOW(), NOW()
);

-- 5. Inserir Venda de Pacote
-- Noiva Ana: Pacote de 5000, pagou 2500. Saldo 2500. Evento em 20 dias. (Quitacao em 10 dias).
INSERT INTO pacote_vendas (
    cliente_id,
    pacote_id,
    data_venda,
    data_evento,
    valor_total,
    valor_pago,
    status,
    "updatedAt", "createdAt"
) VALUES (
    (SELECT id FROM clientes WHERE nome = 'Ana Costa' LIMIT 1),
    (SELECT id FROM pacotes LIMIT 1),
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '20 days',
    5000.00,
    2500.00,
    'ativo',
    NOW(), NOW()
);

-- 6. Validar inserção
SECTION_VALIDAR:
SELECT 
    'ATENDIMENTO CRIADO' as item,
    c.nome, 
    a.valor_total, 
    a.valor_pago, 
    (a.valor_total - a.valor_pago) as saldo 
FROM atendimentos a 
JOIN clientes c ON a.cliente_id = c.id 
WHERE c.nome = 'Maria Silva'
UNION ALL
SELECT 
    'PACOTE CRIADO' as item,
    c.nome, 
    pv.valor_total, 
    pv.valor_pago, 
    (pv.valor_total - pv.valor_pago) as saldo 
FROM pacote_vendas pv 
JOIN clientes c ON pv.cliente_id = c.id 
WHERE c.nome = 'Ana Costa';
