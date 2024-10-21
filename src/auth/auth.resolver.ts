import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignUpInput,LoginInput } from './dto/inputs';
import { AuthResponse } from './dto/types/auth-response.type';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ValidRoles } from './enums/valid-roles.enum';

@Resolver(() => AuthResponse)
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


  @Mutation(() => AuthResponse, {name:'login'})
  async login(@Args('loginInput') loginInput: LoginInput):Promise<AuthResponse>{

    return this.authService.login(loginInput)

  }

  @Query(() => AuthResponse, {name:'revalidate'})
  @UseGuards(JwtAuthGuard)
    revalidateToken(
      @CurrentUser([ValidRoles.admin]) user:User
    ) : AuthResponse{
    return this.authService.revalidateToken(user)


  }

}
