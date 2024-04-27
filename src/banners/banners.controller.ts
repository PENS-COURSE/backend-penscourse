import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AllowUnauthorizedRequest } from '../authentication/metadata/allow-unauthorized-request.decorator';
import { Auth } from '../utils/decorators/auth.decorator';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Auth('admin', 'dosen')
  @Post('create')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create banner' })
  @ApiCreatedResponse()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data = await this.bannersService.create(createBannerDto, file);

    return {
      message: '',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @Get()
  @ApiOperation({ summary: 'Get all banners' })
  @ApiOkResponse()
  async findAll() {
    const data = await this.bannersService.findAll();

    return {
      message: '',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @Get('admin')
  @ApiOperation({ summary: 'Get all banners for admin' })
  @ApiOkResponse()
  async findAllforAdmin() {
    const data = await this.bannersService.findAllForAdmin();

    return {
      message: '',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @Get(':id')
  @ApiOperation({ summary: 'Get one banner' })
  @ApiOkResponse()
  async findOne(@Param('id') id: string) {
    const data = await this.bannersService.findOne(+id);

    return {
      message: '',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Update banner' })
  @Patch(':id/update')
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse()
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.bannersService.update(+id, updateBannerDto, file);

    return {
      message: '',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Remove banner' })
  @Delete(':id/remove')
  @ApiOkResponse()
  async remove(@Param('id') id: string) {
    const data = await this.bannersService.remove(+id);

    return {
      message: '',
      data,
    };
  }
}
