-- CreateEnum
CREATE TYPE "TipoAtendimento" AS ENUM ('servico_social', 'atendimento_comum');

-- CreateEnum
CREATE TYPE "StatusPacoteVenda" AS ENUM ('ativo', 'quitado', 'cancelado');

-- AlterTable
ALTER TABLE "atendimentos" ADD COLUMN     "tipo" "TipoAtendimento" NOT NULL DEFAULT 'atendimento_comum',
ADD COLUMN     "valor_pago" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "valor_total" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "pacote_vendas" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "pacote_id" INTEGER NOT NULL,
    "data_venda" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_evento" DATE NOT NULL,
    "valor_total" DECIMAL(10,2) NOT NULL,
    "valor_pago" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "StatusPacoteVenda" NOT NULL DEFAULT 'ativo',
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacote_vendas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pacote_vendas_data_evento_idx" ON "pacote_vendas"("data_evento");

-- CreateIndex
CREATE INDEX "pacote_vendas_status_idx" ON "pacote_vendas"("status");

-- CreateIndex
CREATE INDEX "pacote_vendas_cliente_id_idx" ON "pacote_vendas"("cliente_id");

-- CreateIndex
CREATE INDEX "atendimentos_tipo_idx" ON "atendimentos"("tipo");

-- AddForeignKey
ALTER TABLE "pacote_vendas" ADD CONSTRAINT "pacote_vendas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacote_vendas" ADD CONSTRAINT "pacote_vendas_pacote_id_fkey" FOREIGN KEY ("pacote_id") REFERENCES "pacotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
