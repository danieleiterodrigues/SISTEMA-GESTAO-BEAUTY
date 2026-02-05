import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';

@Module({
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService], // Exporting in case other modules need it
})
export class ClientesModule {}
