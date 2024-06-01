import { ConfigurableModuleBuilder } from '@nestjs/common';
import { XenditOptions } from './interface/xendit-options.interface';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<XenditOptions>().build();
