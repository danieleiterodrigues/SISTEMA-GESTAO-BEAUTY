/*
  Warnings:

  - You are about to drop the column `categoria` on the `servicos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "servicos" DROP COLUMN "categoria",
ADD COLUMN     "categoria_id" INTEGER,
ADD COLUMN     "valor_custo" DECIMAL(10,2),
ALTER COLUMN "comissao_tipo" DROP NOT NULL,
ALTER COLUMN "comissao_valor" DROP NOT NULL;

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
