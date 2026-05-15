import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderResponseDto } from './dto/order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: jest.Mocked<OrderService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            createOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(OrderController);
    service = module.get(OrderService);
  });

  describe('POST /order', () => {
    const dto: CreateOrderDto = {
      email: 'user@example.com',
      phone: '+7 (000) 000-00-00',
      tickets: [
        {
          film: 'film-id',
          session: 'session-id',
          daytime: '2024-06-28T10:00:00Z',
          row: 1,
          seat: 1,
          price: 350,
        },
      ],
    };

    it('передаёт тело запроса в OrderService.createOrder и возвращает результат', async () => {
      const expected: OrderResponseDto = {
        total: 1,
        items: [
          {
            id: 'ticket-id',
            film: 'film-id',
            session: 'session-id',
            daytime: '2024-06-28T10:00:00Z',
            row: 1,
            seat: 1,
            price: 350,
          },
        ],
      };
      service.createOrder.mockResolvedValue(expected);

      const result = await controller.createOrder(dto);

      expect(service.createOrder).toHaveBeenCalledWith(dto);
      expect(service.createOrder).toHaveBeenCalledTimes(1);
      expect(result).toBe(expected);
    });

    it('пробрасывает BadRequestException из сервиса наружу', async () => {
      service.createOrder.mockRejectedValue(
        new BadRequestException('Seat 1:1 is already taken'),
      );

      await expect(controller.createOrder(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
