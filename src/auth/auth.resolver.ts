import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignUpInput } from './dto/inputs/signup.input';
import { AuthResponse } from './dto/types/auth-response.type';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Mutation(() => AuthResponse , {name:'signup'})
  async signup(
    @Args('signupInput') signupInput: SignUpInput
  ):Promise<AuthResponse>{

    return  this.authService.signup(signupInput)

  }


  // @Mutation(() => String, {name:'login'})
  // async login():Promise<>{

  //   // return  this.authService.login()

  // }

  // @Query(() => String, {name:'revalidate'})
  // async revalidateToken(){
  //   // return this.authService.revalidateToken()
  // }

}
