import { Mutation, Resolver } from '@nestjs/graphql';
import { SeedService } from './seed.service';

@Resolver()
export class SeedResolver {
  constructor(private readonly seedService: SeedService) {}


  @Mutation(() => Boolean,{description:'Ejecuta la creacion de la db',name:'executeSeed'})
  async executeSeed(): Promise<boolean>{
    return this.seedService.executeSeed()
  }
}
