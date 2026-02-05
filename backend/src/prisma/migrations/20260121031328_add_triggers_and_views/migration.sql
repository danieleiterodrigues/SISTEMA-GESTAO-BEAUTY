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

-- View Consolidada de Previsão de Quitações
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
    AND a.status IN ('agendado', 'em_atendimento', 'concluido')
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