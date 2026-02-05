/*
  Warnings:

  - The `periodicidade` column on the `despesas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[bandeira,tipo_transacao,parcelas]` on the table `taxas_maquininha` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PeriodicidadeDespesa" AS ENUM ('mensal', 'bimestral', 'trimestral', 'semestral', 'anual');

-- AlterTable
ALTER TABLE "despesas" DROP COLUMN "periodicidade",
ADD COLUMN     "periodicidade" "PeriodicidadeDespesa";

-- CreateIndex
CREATE INDEX "comissoes_colaborador_id_idx" ON "comissoes"("colaborador_id");

-- CreateIndex
CREATE INDEX "comissoes_status_idx" ON "comissoes"("status");

-- CreateIndex
CREATE INDEX "comissoes_data_referencia_idx" ON "comissoes"("data_referencia");

-- CreateIndex
CREATE INDEX "comissoes_venda_id_idx" ON "comissoes"("venda_id");

-- CreateIndex
CREATE UNIQUE INDEX "taxas_maquininha_bandeira_tipo_transacao_parcelas_key" ON "taxas_maquininha"("bandeira", "tipo_transacao", "parcelas");
