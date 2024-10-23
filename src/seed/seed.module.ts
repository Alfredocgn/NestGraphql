import { ConfigModule } from '@nestjs/config';
import { ItemsModule } from 'src/items/items.module';
import { Module } from '@nestjs/common';
import { SeedResolver } from './seed.resolver';
import { SeedService } from './seed.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [SeedResolver, SeedService],
  imports:[
    ConfigModule,
    UsersModule,
    ItemsModule

  ]
})
export class SeedModule {}