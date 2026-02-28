import { Test, TestingModule } from '@nestjs/testing';
import { FloorItemsController } from './floor-items.controller';

describe('FloorItemsController', () => {
  let controller: FloorItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FloorItemsController],
    }).compile();

    controller = module.get<FloorItemsController>(FloorItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
