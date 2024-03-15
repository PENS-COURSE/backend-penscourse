import { DynamicModule, Module } from '@nestjs/common';
import { XenditOptions } from './interface/xendit-options.interface';
import { XenditService } from './xendit.service';

@Module({})
export class XenditModule {
  static register(options: XenditOptions): DynamicModule {
    return {
      module: XenditModule,
      providers: [
        { provide: 'CONFIG_OPTIONS', useValue: options },
        XenditService,
      ],
      exports: [XenditService],
    };
  }
}
