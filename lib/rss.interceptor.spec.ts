import { Observable, firstValueFrom, of } from 'rxjs';
import { RssChannel, RssInterceptor, RssItem } from './rss.interceptor';
import { xml2js } from 'xml-js';

const request = {
  protocol: 'http',
  url: '/rss-test',
  headers: { host: 'example.com' }
};

const response = {
  header: jest.fn()
};

const executionContext = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnValue(request),
  getResponse: jest.fn().mockReturnValue(response),
}

const callHandler = {
  handle: jest.fn<Observable<RssChannel>, any[], any>()
};

function createRssChannel(items: RssItem[]): RssChannel {
  return {
    title: 'Test channel',
    link: 'http://example.com/rss',
    description: 'This is a test channel',
    items: items,
  };
}

describe('RssInterceptor', () => {
  beforeEach(async () => {});

  it('should be defined', () => {
    const interceptor = new RssInterceptor();
    expect(interceptor).toBeDefined();
  });

  it('should parse empty rss feed', async () => {
    // Mock an empty channel
    const channel = createRssChannel([]);
    callHandler.handle.mockReturnValueOnce(of(channel));

    // Run the interceptor
    const interceptor = new RssInterceptor();
    const observable = await interceptor.intercept(executionContext as any, callHandler);
    const value = await firstValueFrom(observable);

    // Test the response
    expect(value).toEqual('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Test channel</title><link>http://example.com/rss</link><description>This is a test channel</description><atom:link href="http://example.com/rss-test" rel="self" type="application/rss+xml"/></channel></rss>');
  });

  it('should create valid simple item', async () => {
    // Mock the channel
    const channel = createRssChannel([
      {
        title: 'Test item',
      }
    ]);
    callHandler.handle.mockReturnValueOnce(of(channel));

    // Run the interceptor
    const interceptor = new RssInterceptor();
    const observable = await interceptor.intercept(executionContext as any, callHandler);
    const value = await firstValueFrom(observable);
    
    const obj: any = xml2js(value, { compact: true });
    expect(obj.rss.channel.item.title._text).toEqual('Test item');
  });
});
