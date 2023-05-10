import { Test, TestingModule } from '@nestjs/testing';
import { RssInterceptor } from './rss.interceptor';

describe('InsightsController', () => {
  beforeEach(async () => {
  });

  it('should be defined', () => {
    let interceptor = new RssInterceptor();
    expect(interceptor).toBeDefined();
  });
});
