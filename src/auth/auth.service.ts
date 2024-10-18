import { Injectable } from '@nestjs/common';
import { SignUpInput } from './dto/inputs/signup.input';
import { AuthResponse } from './dto/types/auth-response.type';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService : UsersService,
  ){}


  async signup(signupInput:SignUpInput): Promise<AuthResponse>{

    const user = await this.usersService.create(signupInput)

    const token = 'ABC123'
    
    return{

      token,user
    }
  }


}
