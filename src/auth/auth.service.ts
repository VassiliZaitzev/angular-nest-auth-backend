import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';


import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response.interface';
import { RegisterUserDto, CreateUserDto, UpdateAuthDto, LoginDto } from './dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) 
    private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 1- Encriptar la contraseña
    // 2- Guardar el usuario
    // 3- Generar el JWT

    
    try {
      const {password,...userData} = createUserDto;
      const newUser = new this.userModel(
        {
          password: bcrypt.hashSync(password,10),
          ...userData
        }
      );
      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();
      return user;
      
    } catch (error) {
      if(error.code === 11000){
        throw new BadRequestException(`${createUserDto.email} Already exist`)
      }

      throw new InternalServerErrorException('Algo pasó');
    }
    
  }

  async register(registerDto:RegisterUserDto):Promise<LoginResponse>{
    const user = await this.create(registerDto);
    if(!user) throw new BadRequestException('');

    return {
      user:user,
      token: this.getJWT({id: user._id})
    }
  }

  async login(loginDto:LoginDto):Promise<LoginResponse>{
    console.log({loginDto})
    const {email,password} = loginDto;
    const user = await this.userModel.findOne({email});
    
    if(!user) throw new UnauthorizedException(`Invalido`);

    if(!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Not valid credentials bas pass');
    
    const {password: _, ...rest} = user.toJSON();
    return {
      user:rest,
      token: this.getJWT({id: user._id})
    }

    /*
      regresar user {id. user. mail, etc}
      JWT
    */

  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJWT(payload:JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }

  async findUserById(id:string){
    const user = await this.userModel.findById(id);

    const {password, ...rest} = user.toJSON();
    return rest;
  }
}
