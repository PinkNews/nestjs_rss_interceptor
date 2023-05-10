import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { ProtocolExtractor, RssInterceptor } from './rss.interceptor';

export function Rss(protocolExtractor?: ProtocolExtractor) {
  return applyDecorators(UseInterceptors(new RssInterceptor(protocolExtractor)));
}
