import { IsString } from "class-validator";


export class CreateCarDto{

  @IsString({message:`The brand must be a cool string`})
  readonly brand:string;

  @IsString()
  readonly model:string;
}