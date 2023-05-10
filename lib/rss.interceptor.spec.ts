import { Test, TestingModule } from '@nestjs/testing';
import { RssInterceptor } from './rss.interceptor';

describe('InsightsController', () => {
  beforeEach(async () => {
  });

  it('should be defined', () => {
    const interceptor = new RssInterceptor();
    expect(interceptor).toBeDefined();
  });

  it('should parse empty rss feed', () => {
    const interceptor = new RssInterceptor();
  })
});
