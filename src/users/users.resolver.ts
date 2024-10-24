import { Resolver, Query, Mutation, Args, Int, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { ValidRolesArgs } from './dto/args/roles.arg';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { ItemsService } from 'src/items/items.service';
import { Item } from '../items/entities/item.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from 'src/lists/entities/list.entity';
import { ListsService } from 'src/lists/lists.service';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService : ItemsService,
    private readonly listsService : ListsService


  ) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() validRoles:ValidRolesArgs,
    @CurrentUser([ValidRoles.admin, ValidRoles.superuser]) user:User,
    @Args() paginationArgs:PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ) : Promise<User[]> {
    return this.usersService.findAll(validRoles.roles,paginationArgs,searchArgs);
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @Args('id', { type: () => ID },ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin, ValidRoles.superuser]) user:User
  ) : Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User,{name:'updateUser'})
  async updateUser(
    @Args('updateUserInput')  
    updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.admin]) user:User
  ):Promise<User>{
    return await this.usersService.update(updateUserInput.id,updateUserInput,user)
  }


  @Mutation(() => User,{name: 'blockUser'})
  blockUser(
    @Args('id', { type: () => ID },ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin]) user:User
  ): Promise<User> {
    return this.usersService.block(id,user);
  }

  @ResolveField(() => Int, {name:'itemCount'})
  async itemCount(
    @CurrentUser([ValidRoles.admin]) adminUser:User,
    @Parent() user:User
  ):Promise<number>{
    

    return await this.itemsService.itemCountByUser(user)
  }

  @ResolveField(() => Int,{name:'listCount'})
  async listCount(
    @CurrentUser([ValidRoles.admin]) adminUser:User,
    @Parent()user:User
  ):Promise<number>{
    return await this.listsService.listCountByUser(user)
  }


  @ResolveField(() => [Item], {name:'items'})
  async getItemsByUser(
    @CurrentUser([ValidRoles.admin]) adminUser:User,
    @Parent() user:User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs
  ):Promise<Item[]>{
    

    return await this.itemsService.findAll(user,paginationArgs,searchArgs);
  }

  @ResolveField(() => [List], {name:'lists'})
  async getListsByUser(
    @CurrentUser([ValidRoles.admin]) adminUser:User,
    @Parent() user: User,
    @Args() paginationArgs:PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<List[]>{
    return await this.listsService.findAll(user,paginationArgs,searchArgs)
  }
}
