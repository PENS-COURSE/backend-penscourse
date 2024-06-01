import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './config.module-definition';
import { XenditService } from './xendit.service';

@Module({
  providers: [XenditService],
  exports: [XenditService],
})
export class XenditModule extends ConfigurableModuleClass {
  // static register(options: XenditOptions): DynamicModule {
  //   return {
  //     module: XenditModule,
  //     providers: [
  //       { provide: 'CONFIG_OPTIONS', useValue: options },
  //       XenditService,
  //     ],
  //     exports: [XenditService],
  //   };
  // }
  // static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
  //   return {
  //     module: XenditModule,
  //     providers: [
  //       {
  //         provide: 'CONFIG_OPTIONS',
  //         useFactory: options.useFactory,
  //         inject: options.inject,
  //       },
  //       XenditService,
  //     ],
  //     exports: [XenditService],
  //     ...super.registerAsync(options),
  //   };
  // }
}
