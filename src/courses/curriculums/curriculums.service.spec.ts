import { Test, TestingModule } from '@nestjs/testing';
import { CurriculumsService } from './curriculums.service';

describe('CurriculumsService', () => {
  let service: CurriculumsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurriculumsService],
    }).compile();

    service = module.get<CurriculumsService>(CurriculumsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
