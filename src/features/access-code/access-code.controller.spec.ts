import { Test, TestingModule } from '@nestjs/testing';
import { AccessCodeController } from './access-code.controller';
import { AccessCodeService } from './access-code.service';

describe('AccessCodeController', () => {
  let controller: AccessCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessCodeController],
      providers: [AccessCodeService],
    }).compile();

    controller = module.get<AccessCodeController>(AccessCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
