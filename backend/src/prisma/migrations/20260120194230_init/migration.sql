-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('admin', 'gerente', 'atendente', 'profissional');

-- CreateEnum
CREATE TYPE "StatusCliente" AS ENUM ('ativo', 'inativo', 'prospecto');

-- CreateEnum
CREATE TYPE "TipoColaborador" AS ENUM ('profissional', 'administrativo');

-- CreateEnum
CREATE TYPE "ComissaoTipo" AS ENUM ('percentual', 'fixo');

-- CreateEnum
CREATE TYPE "StatusAtendimento" AS ENUM ('agendado', 'em_atendimento', 'concluido', 'cancelado');

-- CreateEnum
CREATE TYPE "TipoVenda" AS ENUM ('servico', 'pacote', 'produto');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('dinheiro', 'debito', 'credito', 'pix', 'transferencia');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('pendente', 'parcial', 'pago', 'cancelado');

-- CreateEnum
CREATE TYPE "StatusParcela" AS ENUM ('pendente', 'pago', 'vencido');

-- CreateEnum
CREATE TYPE "StatusDespesa" AS ENUM ('pendente', 'pago', 'vencido', 'cancelado');

-- CreateEnum
CREATE TYPE "StatusComissao" AS ENUM ('pendente', 'pago');

-- CreateEnum
CREATE TYPE "TipoTransacao" AS ENUM ('debito', 'credito');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "perfil" "Perfil" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100),
    "data_nascimento" DATE,
    "cpf" VARCHAR(14),
    "endereco" TEXT,
    "cidade" VARCHAR(100),
    "estado" VARCHAR(2),
    "cep" VARCHAR(9),
    "observacoes" TEXT,
    "status" "StatusCliente" NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ultima_visita" TIMESTAMP(3),

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaboradores" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "tipo" "TipoColaborador" NOT NULL,
    "telefone" VARCHAR(20),
    "email" VARCHAR(100),
    "cpf" VARCHAR(14),
    "data_admissao" DATE,
    "comissao_padrao" DECIMAL(5,2),
    "usuario_id" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colaboradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "categoria" VARCHAR(50),
    "duracao_minutos" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "comissao_tipo" "ComissaoTipo" NOT NULL,
    "comissao_valor" DECIMAL(10,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacotes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "validade_dias" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pacotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacote_servicos" (
    "id" SERIAL NOT NULL,
    "pacote_id" INTEGER NOT NULL,
    "servico_id" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "pacote_servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "codigo_barras" VARCHAR(50),
    "categoria" VARCHAR(50),
    "valor_custo" DECIMAL(10,2),
    "valor_venda" DECIMAL(10,2) NOT NULL,
    "estoque_atual" INTEGER NOT NULL DEFAULT 0,
    "estoque_minimo" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atendimentos" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "colaborador_id" INTEGER NOT NULL,
    "data_atendimento" DATE NOT NULL,
    "horario_inicio" TIME NOT NULL,
    "horario_fim" TIME,
    "status" "StatusAtendimento" NOT NULL,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atendimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atendimento_servicos" (
    "id" SERIAL NOT NULL,
    "atendimento_id" INTEGER NOT NULL,
    "servico_id" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "valor_unitario" DECIMAL(10,2) NOT NULL,
    "desconto" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "atendimento_servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "atendimento_id" INTEGER,
    "tipo_venda" "TipoVenda" NOT NULL,
    "data_venda" DATE NOT NULL,
    "valor_total" DECIMAL(10,2) NOT NULL,
    "desconto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "valor_final" DECIMAL(10,2) NOT NULL,
    "forma_pagamento" "FormaPagamento" NOT NULL,
    "status_pagamento" "StatusPagamento" NOT NULL,
    "parcelas" INTEGER NOT NULL DEFAULT 1,
    "taxa_maquininha" DECIMAL(5,2),
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelas" (
    "id" SERIAL NOT NULL,
    "venda_id" INTEGER NOT NULL,
    "numero_parcela" INTEGER NOT NULL,
    "valor_parcela" DECIMAL(10,2) NOT NULL,
    "data_vencimento" DATE NOT NULL,
    "data_pagamento" DATE,
    "status" "StatusParcela" NOT NULL DEFAULT 'pendente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despesas" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(200) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data_vencimento" DATE NOT NULL,
    "data_pagamento" DATE,
    "status" "StatusDespesa" NOT NULL,
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "periodicidade" VARCHAR(20),
    "forma_pagamento" VARCHAR(50),
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "despesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comissoes" (
    "id" SERIAL NOT NULL,
    "colaborador_id" INTEGER NOT NULL,
    "venda_id" INTEGER,
    "atendimento_servico_id" INTEGER,
    "valor_base" DECIMAL(10,2) NOT NULL,
    "percentual" DECIMAL(5,2),
    "valor_comissao" DECIMAL(10,2) NOT NULL,
    "data_referencia" DATE NOT NULL,
    "status" "StatusComissao" NOT NULL DEFAULT 'pendente',
    "data_pagamento" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxas_maquininha" (
    "id" SERIAL NOT NULL,
    "bandeira" VARCHAR(50) NOT NULL,
    "tipo_transacao" "TipoTransacao" NOT NULL,
    "parcelas" INTEGER NOT NULL DEFAULT 1,
    "taxa_percentual" DECIMAL(5,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "taxas_maquininha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_key" ON "clientes"("cpf");

-- CreateIndex
CREATE INDEX "clientes_nome_idx" ON "clientes"("nome");

-- CreateIndex
CREATE INDEX "clientes_telefone_idx" ON "clientes"("telefone");

-- CreateIndex
CREATE INDEX "clientes_cpf_idx" ON "clientes"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_cpf_key" ON "colaboradores"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_usuario_id_key" ON "colaboradores"("usuario_id");

-- CreateIndex
CREATE INDEX "atendimentos_data_atendimento_idx" ON "atendimentos"("data_atendimento");

-- CreateIndex
CREATE INDEX "atendimentos_cliente_id_idx" ON "atendimentos"("cliente_id");

-- CreateIndex
CREATE INDEX "atendimentos_colaborador_id_idx" ON "atendimentos"("colaborador_id");

-- CreateIndex
CREATE INDEX "vendas_data_venda_idx" ON "vendas"("data_venda");

-- CreateIndex
CREATE INDEX "vendas_cliente_id_idx" ON "vendas"("cliente_id");

-- CreateIndex
CREATE INDEX "despesas_data_vencimento_idx" ON "despesas"("data_vencimento");

-- AddForeignKey
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacote_servicos" ADD CONSTRAINT "pacote_servicos_pacote_id_fkey" FOREIGN KEY ("pacote_id") REFERENCES "pacotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacote_servicos" ADD CONSTRAINT "pacote_servicos_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento_servicos" ADD CONSTRAINT "atendimento_servicos_atendimento_id_fkey" FOREIGN KEY ("atendimento_id") REFERENCES "atendimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento_servicos" ADD CONSTRAINT "atendimento_servicos_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_atendimento_id_fkey" FOREIGN KEY ("atendimento_id") REFERENCES "atendimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_atendimento_servico_id_fkey" FOREIGN KEY ("atendimento_servico_id") REFERENCES "atendimento_servicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
