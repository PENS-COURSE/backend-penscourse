import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../utils/decorators/auth.decorator';
import {
  CreateDynamicConfigurationDto,
  CreateDynamicConfigurationValuesDto,
  UpdateDynamicConfigurationDto,
  UpdateDynamicConfigurationValuesDto,
} from './dynamic-configuration.dto';
import { DynamicConfigurationsService } from './dynamic-configurations.service';

@ApiTags('Dynamic Configurations')
@Controller('dynamic-configurations')
export class DynamicConfigurationsController {
  constructor(
    private readonly dynamicConfigurationsService: DynamicConfigurationsService,
  ) {}

  @Auth('admin')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Retrieve all dynamic configurations' })
  @Get()
  async findAll() {
    const data = await this.dynamicConfigurationsService.findAll();

    return {
      message: 'Data has been retrieved successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Retrieve dynamic configuration by slug' })
  @Get(':slug')
  async findOneBySlug(@Param('slug') slug: string) {
    const data = await this.dynamicConfigurationsService.findOne({
      by: 'slug',
      id: slug,
    });

    return {
      message: 'Data has been retrieved successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiCreatedResponse()
  @ApiOperation({ summary: 'Create dynamic configuration' })
  @Post('create')
  async create(@Body() payload: CreateDynamicConfigurationDto) {
    const data = await this.dynamicConfigurationsService.create({ payload });

    return {
      message: 'Data has been created successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Update dynamic configuration by slug' })
  @Post(':slug/update')
  async update(
    @Param('slug') slug: string,
    @Body() payload: UpdateDynamicConfigurationDto,
  ) {
    const data = await this.dynamicConfigurationsService.update({
      slug,
      payload,
    });

    return {
      message: 'Data has been updated successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Delete dynamic configuration by slug' })
  @Post(':slug/delete')
  async delete(@Param('slug') slug: string) {
    const data = await this.dynamicConfigurationsService.remove({ slug });

    return {
      message: 'Data has been deleted successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Retrieve dynamic configuration value' })
  @Get(':slug/values/:id')
  async findValue(@Param('slug') slug: string, @Param('id') id: number) {
    const data = await this.dynamicConfigurationsService.findValue({
      slug,
      id,
    });

    return {
      message: 'Data has been retrieved successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiCreatedResponse()
  @ApiOperation({ summary: 'Add dynamic configuration value' })
  @Post(':slug/values/add')
  async addValues(
    @Param('slug') slug: string,
    @Body() payload: CreateDynamicConfigurationValuesDto,
  ) {
    const data = await this.dynamicConfigurationsService.addValues({
      slug,
      payload,
    });

    return {
      message: 'Data has been created successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Update dynamic configuration value' })
  @Post(':slug/values/:id/update')
  async updateValues(
    @Param('slug') slug: string,
    @Param('id') id: number,
    @Body() payload: UpdateDynamicConfigurationValuesDto,
  ) {
    const data = await this.dynamicConfigurationsService.updateValues({
      slug,
      id,
      payload,
    });

    return {
      message: 'Data has been updated successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Delete dynamic configuration value' })
  @Post(':slug/values/:id/delete')
  async removeValues(@Param('slug') slug: string, @Param('id') id: number) {
    const data = await this.dynamicConfigurationsService.removeValues({
      slug,
      id,
    });

    return {
      message: 'Data has been deleted successfully',
      data,
    };
  }
}
