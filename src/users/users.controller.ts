import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../utils/decorators/auth.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth('admin')
  @ApiOperation({ summary: 'Create user' })
  @ApiCreatedResponse()
  @HttpCode(201)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);

    return {
      message: 'Successfully created user',
      data,
    };
  }

  @Auth('admin')
  @ApiOperation({ summary: 'Find all users' })
  @ApiQuery({ name: 'page', required: false })
  @ApiOkResponse()
  @HttpCode(200)
  @Get()
  async findAll(@Query('page') page: string) {
    const data = await this.usersService.findAll({ page: +page });

    return {
      message: 'Successfully retrieved users',
      data,
    };
  }

  @Auth('admin')
  @ApiOperation({ summary: 'Find one user by ID' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':id')
  async findOneByID(@Param('id') id: string) {
    const data = await this.usersService.findOneByID(+id);

    return {
      message: 'Successfully retrieved user',
      data,
    };
  }

  @Auth('admin')
  @ApiOperation({ summary: 'Update User By ID' })
  @ApiOkResponse()
  @HttpCode(200)
  @Patch(':id/update')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.usersService.update(+id, updateUserDto);

    return {
      message: 'Successfully updated user',
      data,
    };
  }

  @Auth('admin')
  @ApiOperation({ summary: 'Remove User By ID' })
  @ApiOkResponse()
  @HttpCode(200)
  @Delete(':id/remove')
  async remove(@Param('id') id: string) {
    const data = await this.usersService.remove(+id);

    return {
      message: 'Successfully removed user',
      data,
    };
  }
}
