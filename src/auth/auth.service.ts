import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Injectable, Param, UnauthorizedException } from '@nestjs/common';
import { SignUpInput,LoginInput } from './dto/inputs';
import { AuthResponse } from './dto/types/auth-response.type';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService : UsersService,
    private readonly jwtService : JwtService
  ){}

  private getJwtToken(userId:string){
    return this.jwtService.sign({id:userId})
  }


  async signup(signupInput:SignUpInput): Promise<AuthResponse>{

    const user = await this.usersService.create(signupInput)

    const token = this.getJwtToken(user.id)
    
    return{

      token,user
    }
  }

  async login(loginInput:LoginInput):Promise<AuthResponse>{

    const {email,password} = loginInput;

    const user = await this.usersService.findOneByEmail(email)
    if(!bcrypt.compareSync(password,user.password)){
      throw new BadRequestException('Password incorrect')

    }

    const token = this.getJwtToken(user.id)



    return{
      token,
      user  
    }
  }

  async validateUser(id:string):Promise<User>{

    const user = await this.usersService.findOneById(id)

    if(!user.isActive){
      throw new UnauthorizedException('User is inactive, talk to admin')
    }
    delete user.password;
    return user;
    
  }

  revalidateToken(user:User):AuthResponse {
    const token = this.getJwtToken(user.id)

    return {
      token,
      user
    }
  }


}
