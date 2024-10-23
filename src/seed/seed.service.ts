import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { ItemsService } from '../items/items.service';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SeedService {

  private isProd: boolean

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemsRepository : Repository<Item>,

    @InjectRepository(User)
    private readonly usersRepository : Repository<User>,

    private readonly usersService: UsersService,

    private readonly ItemsService: ItemsService


  ){
    this.isProd = this.configService.get('STATE') === 'prod';
  }

  async executeSeed(){
    if(this.isProd){
      throw new UnauthorizedException('We cannot run seed on prod')
    }

    await this.deleteDatabase()

    const user = await this.loadUsers()

    await this.loadItems(user)


    return true
  }

  async deleteDatabase(){

    await this.itemsRepository.createQueryBuilder()
    .delete()
    .where({})
    .execute();

    await this.usersRepository.createQueryBuilder()
    .delete()
    .where({})
    .execute();
  }

  async loadUsers() : Promise<User>{
    const users = [];
    for (const user of SEED_USERS){
      users.push(await this.usersService.create(user))
    }

    return users[0]
  }

  async loadItems(user:User): Promise<void> {
    
    const itemsPromises = []
    for (const item of SEED_ITEMS){
      itemsPromises.push(await this.ItemsService.create(item,user))
    }

    await Promise.all(itemsPromises)
  }
}
