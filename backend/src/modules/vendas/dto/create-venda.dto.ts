import { IsInt, IsNotEmpty, IsDateString, IsEnum, IsNumber, Min, IsOptional, IsString, ValidateIf } from 'class-validator';
import { TipoVenda, FormaPagamento, StatusPagamento } from '@prisma/client';

export class CreateVendaDto {
  @IsInt()
  @IsNotEmpty()
  clienteId: number;

  @IsOptional()
  @IsInt()
  atendimentoId?: number;

  @IsEnum(TipoVenda)
  @IsNotEmpty()
  tipoVenda: TipoVenda;

  @IsDateString()
  @IsNotEmpty()
  dataVenda: string;

  @IsNumber()
  @Min(0)
  valorTotal: number;

  @IsNumber()
  @Min(0)
  desconto: number;

  @IsNumber()
  @Min(0)
  valorFinal: number;

  @IsEnum(FormaPagamento)
  @IsNotEmpty()
  formaPagamento: FormaPagamento;

  @IsEnum(StatusPagamento)
  @IsNotEmpty()
  statusPagamento: StatusPagamento;

  @IsInt()
  @Min(1)
  parcelas: number;

  @IsOptional()
  @IsNumber()
  taxaMaquininha?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
  
  // Specific fields for Product Sales
  // We need to know which products were sold to update stock
  // Ideally we should have a VendaItem table? 
  // Schema check: Venda table doesn't have items? 
  // Wait, Schema check: 
  // Vendas table -> One record per sale.
  // If tipo_venda = produto, where are the items?
  // Schema Review:
  // There is NO `venda_itens` table in the provided schema!
  // `atendimento_servicos` links services to appointment.
  // But for direct product sales?
  // `vendas` table ...
  // Wait, `pacote_servicos` exists.
  // `atendimento_servicos` exists.
  // But `venda_produtos` MISSING in the PRD Schema provided earlier?
  // Let me check PRD content again.
  // 
  // PRD line 379: TABELA vendas.
  // It has tipo_venda.
  // But no link to products?
  // This is a flaw in the PRD Schema if we want to sell multiple products in one go and track them.
  // Or maybe valid for 1 product? No, "Vendas" usually implies a basket.
  // 
  // If I look at the schema, I don't see `venda_itens` or `venda_produtos`.
  // This might be a missing table in the PRD I received or I missed it.
  // 
  // Quick Fix for MVP/Constraint:
  // Since I cannot change the DB schema on the fly easily without migration (which I can do but user asked to follow PRD),
  // I will check if I missed it.
  // 
  // Scanning schema.prisma...
  // Model Venda: has cliente, atendimento, parcelas, comissoes. No "produtos".
  // 
  // This means currently we can record the VALUE of the sale, but not WHAT was sold if it's a product sale (unless we use observacoes or add a table).
  // 
  // CRITICAL: To update stock, I need to know what product.
  // I will add a `produtoId` field to dto? No, usually it's N items.
  // 
  // I will proceed by ASSUMING the user might have missed this, OR I might have requested to add it.
  // Start of conversation mentioned "DB Update".
  // 
  // Decision: I will implement Venda logic.
  // If `tipoVenda` is `produto`, I will expect an array of `{ produtoId, quantidade }` in the DTO, 
  // AND I will create a `observacoes` string listing them, AND I will decrement stock.
  // But I won't be able to store the structured items in a relational table because it doesn't exist yet.
  // 
  // Ideally, I should propose adding `VendaItem`.
  // But for this task "Implementar Módulo Financeiro", I will stick to what exists.
  // I will handle stock update logic even if I don't persist references to items in a specific table (only in logs/obs).
  // 
  // WAIT! This is risky. If I sell 10 shampoos, I need to know I sold them.
  // I'll add a section in DTO `itens` (optional) just for processing stock.
}
