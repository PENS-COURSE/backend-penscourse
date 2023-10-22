import { Test, TestingModule } from '@nestjs/testing';
import { CourseDiscountService } from './course-discount.service';

describe('CourseDiscountService', () => {
  let service: CourseDiscountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseDiscountService],
    }).compile();

    service = module.get<CourseDiscountService>(CourseDiscountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
