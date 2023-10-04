import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create user' })
  @ApiCreatedResponse()
  @HttpCode(201)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);

    return {
      message: '',
      data,
    };
  }

  @ApiOperation({ summary: 'Find all users' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get()
  async findAll() {
    const data = await this.usersService.findAll();

    return {
      message: '',
      data,
    };
  }

  @ApiOperation({ summary: 'Find one user by ID' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':id')
  async findOneByID(@Param('id') id: string) {
    const data = await this.usersService.findOneByID(+id);

    return {
      message: '',
      data,
    };
  }

  @ApiOperation({ summary: 'Update User By ID' })
  @ApiOkResponse()
  @HttpCode(200)
  @Patch(':id/update')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.usersService.update(+id, updateUserDto);

    return {
      message: '',
      data,
    };
  }

  @ApiOperation({ summary: 'Remove User By ID' })
  @ApiOkResponse()
  @HttpCode(200)
  @Delete(':id/remove')
  async remove(@Param('id') id: string) {
    const data = await this.usersService.remove(+id);

    return {
      message: '',
      data,
    };
  }
}
