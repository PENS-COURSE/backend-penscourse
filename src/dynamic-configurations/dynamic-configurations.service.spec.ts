import { Test, TestingModule } from '@nestjs/testing';
import { DynamicConfigurationsService } from './dynamic-configurations.service';

describe('DynamicConfigurationsService', () => {
  let service: DynamicConfigurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DynamicConfigurationsService],
    }).compile();

    service = module.get<DynamicConfigurationsService>(DynamicConfigurationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
