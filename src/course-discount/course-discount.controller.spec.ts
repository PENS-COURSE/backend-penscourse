import { Test, TestingModule } from '@nestjs/testing';
import { CourseDiscountController } from './course-discount.controller';
import { CourseDiscountService } from './course-discount.service';

describe('CourseDiscountController', () => {
  let controller: CourseDiscountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseDiscountController],
      providers: [CourseDiscountService],
    }).compile();

    controller = module.get<CourseDiscountController>(CourseDiscountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
