import { Test, TestingModule } from '@nestjs/testing';
import { FloorItemsService } from './floor-items.service';

describe('FloorItemsService', () => {
  let service: FloorItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FloorItemsService],
    }).compile();

    service = module.get<FloorItemsService>(FloorItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
