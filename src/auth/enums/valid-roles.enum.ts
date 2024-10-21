import { registerEnumType } from "@nestjs/graphql";


export enum ValidRoles {

  admin = 'admin',
  user = 'user',
  superuser = 'superUser',
}

registerEnumType(ValidRoles,{name:'ValidRoles',description:'Roles permitidos auth'})