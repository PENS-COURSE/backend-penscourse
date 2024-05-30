import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../utils/decorators/auth.decorator';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
import { LogoService } from './logo.service';

@ApiTags('Logo')
@Controller('logo')
export class LogoController {
  constructor(private readonly logoService: LogoService) {}

  @Auth('admin')
  @ApiOperation({ summary: 'Create Logo' })
  @ApiCreatedResponse()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @Post('create')
  async create(
    @Body() payload: CreateLogoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data = await this.logoService.create({ file, payload });

    return {
      message: 'Logo created successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiOperation({ summary: 'Get all Logos' })
  @ApiOkResponse()
  @Get()
  @ApiQuery({ name: 'page', required: false, example: 1 })
  async findAll(@Query('page') page: number) {
    const data = await this.logoService.findAll({ page });

    return {
      message: 'Logos found successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiOperation({ summary: 'Get Logo by ID' })
  @ApiOkResponse()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.logoService.findOne({ id: +id });

    return {
      message: 'Logo found successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiOperation({ summary: 'Update Logo by ID' })
  @ApiOkResponse()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateLogoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data = await this.logoService.update({
      id: +id,
      payload,
      file,
    });

    return {
      message: 'Logo updated successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiOperation({ summary: 'Delete Logo by ID' })
  @ApiOkResponse()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.logoService.remove({
      id: +id,
    });

    return {
      message: 'Logo removed successfully',
      data,
    };
  }
}
