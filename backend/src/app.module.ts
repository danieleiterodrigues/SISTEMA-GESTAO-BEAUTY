import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientesModule } from './modules/clientes/clientes.module';

import { ServicosModule } from './modules/servicos/servicos.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { ColaboradoresModule } from './modules/colaboradores/colaboradores.module';
import { AtendimentosModule } from './modules/atendimentos/atendimentos.module';
import { ProdutosModule } from './modules/produtos/produtos.module';
import { PacotesModule } from './modules/pacotes/pacotes.module';
import { DespesasModule } from './modules/despesas/despesas.module';
import { VendasModule } from './modules/vendas/vendas.module';
import { ComissoesModule } from './modules/comissoes/comissoes.module';
import { PacoteVendasModule } from './modules/pacote-vendas/pacote-vendas.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    AuthModule,
    UsuariosModule,
    ClientesModule,
    ServicosModule,
    CategoriasModule,
    ColaboradoresModule,
    AtendimentosModule,
    ProdutosModule,
    PacotesModule,
    DespesasModule,
    VendasModule,
    ComissoesModule,
    PacoteVendasModule,
    DashboardModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
