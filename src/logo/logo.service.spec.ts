import { Test, TestingModule } from '@nestjs/testing';
import { LogoService } from './logo.service';

describe('LogoService', () => {
  let service: LogoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogoService],
    }).compile();

    service = module.get<LogoService>(LogoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
