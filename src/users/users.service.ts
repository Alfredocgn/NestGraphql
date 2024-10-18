import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignUpInput } from 'src/auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {

  private logger = new Logger('UsersService')

  constructor(
    @InjectRepository(User)
    private readonly usersRepository : Repository<User>
  ){}

  async create(signupInput:SignUpInput):Promise<User> {
    try{

      const newUser = this.usersRepository.create(signupInput)

      return await this.usersRepository.save(newUser)

    }catch(error){
      this.handleDBErrors(error)
    }
  }

  async findAll(): Promise<User[]> {
    return []
  }

  // async findOne(id: string):Promise<User> {
  //   return 'hola'
  // }


  // async block(id: string) : Promise<User> {
  //   return 'hola  '
  // }

  private handleDBErrors(error:any): never {

    if(error.code === '23505'){
      throw new BadRequestException(error.detail.replace('Key ',''))
    }

    this.logger.error(error);
    throw new InternalServerErrorException(`Please check server logs`)

  }
}
