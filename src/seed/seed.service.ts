import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { ItemsService } from '../items/items.service';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_LIST, SEED_USERS } from './data/seed-data';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { List } from 'src/lists/entities/list.entity';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { ListsService } from 'src/lists/lists.service';
import { ListItemService } from 'src/list-item/list-item.service';

@Injectable()
export class SeedService {

  private isProd: boolean

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemsRepository : Repository<Item>,

    @InjectRepository(User) 
    private readonly usersRepository : Repository<User>,

    @InjectRepository(ListItem)
    private readonly listItemsRepository : Repository<ListItem>,

    @InjectRepository(List)
    private readonly listsRepository : Repository<List>,

    private readonly usersService: UsersService,

    private readonly itemsService: ItemsService,

    private readonly listService : ListsService,

    private readonly listItemService : ListItemService,


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

    const list = await this.loadLists(user);

    const items = await this.itemsService.findAll(user,{limit:15,offset:0},{})
    await this.loadListItem(list,items)




    return true
  }

  async deleteDatabase(){

    await this.listItemsRepository.createQueryBuilder()
    .delete()
    .where({})
    .execute()

    await this.listsRepository.createQueryBuilder()
    .delete()
    .where({})
    .execute()

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
      itemsPromises.push(await this.itemsService.create(item,user))
    }

    await Promise.all(itemsPromises)
  }

  async loadLists(user:User) : Promise<List>{
    const lists = []

    for (const list of SEED_LIST){
      lists.push(await this.listService.create(list,user))
    }

    return lists[0]
  }

  async loadListItem(list:List,items:Item[]){

    for (const item of items) {
      this.listItemService.create({
        quantity: Math.round(Math.random() * 10),
        completed: Math.round(Math.random() * 1) === 0 ? false : true,
        listId: list.id,
        itemId: item.id
      })
    }
  }
}
