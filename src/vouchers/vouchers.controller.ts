import {
  Body,
  Controller,
  Delete,
  Get,
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
import { User } from '@sentry/node';
import { CurrentUser } from '../authentication/decorators/current-user.decorators';
import { Auth } from '../utils/decorators/auth.decorator';
import {
  ApplyVoucherDto,
  CreateVoucherDto,
  UpdateVoucherDto,
} from './dto/voucher.dto';
import { VouchersService } from './vouchers.service';

@ApiTags('Vouchers - NOT IMPLEMENTED')
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Auth('admin')
  @ApiCreatedResponse()
  @ApiOperation({ summary: 'Create a new voucher' })
  @Post('create')
  async createVoucher(@Body() payload: CreateVoucherDto) {
    const data = await this.vouchersService.createVoucher({ payload });

    return {
      message: 'Voucher created successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Get voucher by ID' })
  @Get(':id')
  async getVoucherById(@Param('id') id: number) {
    const data = await this.vouchersService.getVoucherById({ id });

    return {
      message: 'Voucher found',
      data,
    };
  }

  @Auth()
  @ApiOkResponse()
  @ApiOperation({ summary: 'Get voucher by code' })
  @Get('code/:code')
  async getVoucherByCode(@Param('code') code: string) {
    const data = await this.vouchersService.getVoucherByCode({ code });

    return {
      message: 'Voucher found',
      data,
    };
  }

  @Auth()
  @ApiOkResponse()
  @ApiOperation({ summary: 'Get all vouchers' })
  @Get()
  async getVouchers(@CurrentUser() user: any) {
    const data = await this.vouchersService.getVouchers({ user });

    return {
      message: 'Vouchers found',
      data,
    };
  }

  @Auth('user')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Apply voucher to user cart' })
  @Post('apply')
  async applyVoucher(
    @Body() payload: ApplyVoucherDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.vouchersService.applyVoucher({ payload, user });

    return {
      message: 'Voucher applied successfully',
      data,
    };
  }

  @Auth('user')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Cancel voucher from user cart' })
  @Post('cancel')
  async cancelVoucher(
    @Body() payload: ApplyVoucherDto,
    @CurrentUser() user: User,
  ) {}

  @Auth('admin')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Update voucher by ID' })
  @Patch('update/:id')
  async updateVoucher(
    @Body() payload: UpdateVoucherDto,
    @Param('id') id: number,
  ) {
    const data = await this.vouchersService.updateVoucher({ payload, id });

    return {
      message: 'Voucher updated successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Delete voucher by ID' })
  @Delete('delete/:id')
  async deleteVoucher(@Param('id') id: number) {
    const data = await this.vouchersService.deleteVoucher({ id });

    return {
      message: 'Voucher deleted successfully',
      data,
    };
  }

  @Auth('admin')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Get redemptions by voucher ID' })
  @Get('redemptions/:id')
  async getRedemptions(@Param('id') id: number) {
    const data = await this.vouchersService.getRedemptions({ id });

    return {
      message: 'Redemptions found',
      data,
    };
  }

  @Auth('admin')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Get redemption by ID' })
  @Get('redemption/:id')
  async getRedemptionById(@Param('id') id: number) {
    const data = await this.vouchersService.getRedemptionById({ id });

    return {
      message: 'Redemption found',
      data,
    };
  }
}
