import { Test, TestingModule } from '@nestjs/testing';
import { DynamicConfigurationsController } from './dynamic-configurations.controller';
import { DynamicConfigurationsService } from './dynamic-configurations.service';

describe('DynamicConfigurationsController', () => {
  let controller: DynamicConfigurationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DynamicConfigurationsController],
      providers: [DynamicConfigurationsService],
    }).compile();

    controller = module.get<DynamicConfigurationsController>(DynamicConfigurationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
