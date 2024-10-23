import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import { User } from './entities/user.entity';
import { SignUpInput } from 'src/auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto/update-user.input';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Injectable()
export class UsersService {

  private logger = new Logger('UsersService')

  constructor(
    @InjectRepository(User)
    private readonly usersRepository : Repository<User>
  ){}

  async create(signupInput:SignUpInput):Promise<User> {
    try{

      

      const newUser = this.usersRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10)
      })

      return await this.usersRepository.save(newUser)

    }catch(error){
      this.handleDBErrors(error)
    }
  }

  async findAll(
    roles: ValidRoles[],
    paginationArgs:PaginationArgs,
    searchArgs:SearchArgs)
    : Promise<User[]> {
      
      const {limit,offset} = paginationArgs
      const {search} = searchArgs
      const queryBuilder = this.usersRepository.createQueryBuilder('user')
      .take(limit)
      .skip(offset)

      if(search){
        queryBuilder.andWhere('LOWER(user.fullName) LIKE :fullName',{ fullName:`%${search.toLowerCase()}%`})
      }
    if(roles.length > 0){

      queryBuilder.andWhere('ARRAY[roles] && ARRAY[:...roles]',{roles})

      // return this.usersRepository.find({
      //   //No se necesita si se usa la propiedad lazy 
      //   // relations:{
      //   //   lastUpdateBy:true
      //   // }
      // });
    }
    // return this.usersRepository.createQueryBuilder()
    // .andWhere('ARRAY[roles] && ARRAY[:...roles]')
    // .setParameter('roles',roles)
    // .getMany()
    return queryBuilder.getMany()
  }

  async findOneByEmail(email: string):Promise<User> {
    try{
      return await this.usersRepository.findOneByOrFail({email})

    }catch(error){
      throw new NotFoundException(`${email} not found`)

      // this.handleDBErrors({
      //   code:'error-001',
      //   detail:`${email} not found`
      // })
    }
  }
  async findOneById(id: string):Promise<User> {
    try{
      return await this.usersRepository.findOneByOrFail({id})

    }catch(error){
      throw new NotFoundException(`${id} not found`)
    }
  }

  async update(
    id:string,
    updateUserInput:UpdateUserInput,
    userAdmin:User
  ): Promise<User>{

    try{

      


      const user = await this.usersRepository.preload({id,...updateUserInput});

      user.lastUpdateBy = userAdmin

      return await this.usersRepository.save(user)

    }catch(error){
      this.handleDBErrors(error)
    }



  }

  async block(id:string,adminUser:User): Promise<User>{
    const userToBlock = await this.findOneById(id)

    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = adminUser
    return await this.usersRepository.save(userToBlock)
  }

  private handleDBErrors(error:any): never {

    if(error.code === '23505'){
      throw new BadRequestException(error.detail.replace('Key ',''))
    }

    if(error.code === 'error-001'){
      throw new BadRequestException(error.detail.replace('Key ',''))
    }

    this.logger.error(error);
    throw new InternalServerErrorException(`Please check server logs`)

  }


}
