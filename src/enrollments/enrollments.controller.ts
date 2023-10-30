import { Controller, Get, HttpCode } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../authentication/decorators/current-user.decorators';
import { EnrollmentsService } from './enrollments.service';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all enrollments' })
  @ApiOkResponse()
  @Get('')
  async findAll(@CurrentUser() user: any) {
    const data = await this.enrollmentsService.findAll({ user });

    return {
      message: 'Successfully retrieved all enrollments',
      data,
    };
  }
}
