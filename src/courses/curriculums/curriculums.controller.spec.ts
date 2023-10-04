import { Test, TestingModule } from '@nestjs/testing';
import { CurriculumsController } from './curriculums.controller';

describe('CurriculumsController', () => {
  let controller: CurriculumsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurriculumsController],
    }).compile();

    controller = module.get<CurriculumsController>(CurriculumsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
