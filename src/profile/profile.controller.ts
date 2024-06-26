import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ summary: 'Profile User' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get('')
  async profile() {
    const data = await this.profileService.profile();

    return {
      message: 'Successfully retrieved profile',
      data,
    };
  }

  @ApiOperation({ summary: 'Update Profile User' })
  @ApiOkResponse()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @Patch('update-profile')
  async updateProfile(
    @Body() payload: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const data = await this.profileService.updateProfile(payload, avatar);

    return {
      message: 'Successfully updated profile',
      data,
    };
  }

  @ApiOperation({ summary: 'Change Password User' })
  @ApiOkResponse()
  @HttpCode(200)
  @Patch('change-password')
  async changePassword(@Body() payload: ChangePasswordDto) {
    const data = await this.profileService.changePassword(payload);

    return {
      message: 'Successfully changed password',
      data,
    };
  }
}
