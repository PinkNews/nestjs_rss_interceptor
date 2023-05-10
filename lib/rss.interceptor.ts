import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { format } from 'date-fns';
import { Observable, map } from 'rxjs';
import { js2xml } from "xml-js";

export type RssHour = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;
export type RssDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type RssGuid = string | { isPermaLink?: boolean; value: string };

export interface RssSource {
  url: string;
  name: string;
}

export interface RssEnclosure {
  url: string;
  length: number;
  type: string;
}

export interface RssCategory {
  domain?: string;
  name: string;
}

export interface RssChannelImage {
  url: string;
  title?: string;
  link?: string;
  width?: number;
  height?: number;
  description?: string;
}

export interface RssCloud {
  domain: string;
  port: number;
  path: string;
  registerProcedure: string;
  protocol: string;
}

export interface RssTextInput {
  title: string;
  description: string;
  name: string;
  link: string;
}

export interface RssChannel {
  title: string;
  link: string;
  description: string;
  language?: string;
  copyright?: string;
  managingEditor?: string;
  webMaster?: string;
  pubDate?: Date;
  lastBuildDate?: Date;
  category?: (RssCategory | string)[];
  generator?: string;
  docs?: string;
  cloud?: RssCloud;
  ttl?: number;
  image?: RssChannelImage;
  rating?: string;
  textInput?: RssTextInput;
  skipHours?: Set<RssHour>;
  skipDays?: Set<RssDay>;

  items: RssItem[];
}

export interface RssItem {
  title?: string;
  link?: string;
  description?: string;
  author?: string;
  category?: RssCategory[];
  comments?: string;
  enclosure?: RssEnclosure;
  guid?: RssGuid;
  pubDate?: Date;
  source?: RssSource;
}

export type ProtocolExtractor = (host: HttpArgumentsHost) => string;

const defaultProtocolExtractor: ProtocolExtractor = host => host.getRequest().protocol;

@Injectable()
export class RssInterceptor implements NestInterceptor {
  constructor(private readonly protocolExtractor: ProtocolExtractor = defaultProtocolExtractor) {}

  intercept(context: ExecutionContext, next: CallHandler<RssChannel>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((channel: RssChannel) => {
        const response = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();

        const protocol = this.protocolExtractor(context.switchToHttp());
        const url = `${protocol}://${request.headers.host}${request.url}`;

        const obj = {
          rss: {
            _attributes: { version: '2.0', 'xmlns:atom': 'http://www.w3.org/2005/Atom' },
            channel: {
              ...this.mapChannel(channel, url),
              item: channel.items.map(item => this.mapItem(item)),
            },
          },
        };

        response.header('Content-Type', 'application/rss+xml');
        return js2xml(obj, { compact: true });
      }),
    );
  }

  private mapChannel(channel: RssChannel, requestUrl: string) {
    const result: any = {
      ...stripProperties(channel, ['items']),
      'atom:link': { _attributes: { href: requestUrl, rel: 'self', type: 'application/rss+xml' } },
    };

    if (channel.pubDate) {
      result.pubDate = formatDate(channel.pubDate);
    }

    if (channel.lastBuildDate) {
      result.lastBuildDate = formatDate(channel.lastBuildDate);
    }

    if (channel.skipDays && channel.skipDays.size > 0) {
      result.skipDays = { day: Array.from(channel.skipDays) };
    }

    if (channel.skipHours && channel.skipHours.size > 0) {
      result.skipHours = { hour: Array.from(channel.skipHours) };
    }

    if (channel.category) {
      result.category = this.mapCategory(channel.category);
    }

    if (channel.image) {
      result.image = {
        ...channel.image,
        title: channel.image.title ?? channel.title,
        link: channel.image.link ?? channel.link,
      };
    }

    return result;
  }

  private mapCategory(categories: (RssCategory | string)[]) {
    return categories.map(category => {
      if (typeof category == 'string') {
        return category;
      }

      return { _attributes: { domain: category.domain }, _text: category.name };
    });
  }

  private mapItem(rawItem: RssItem) {
    const item = stripUndefined(rawItem);
    const result: any = { ...item };

    if (item.guid) result.guid = this.mapGuid(item.guid);
    if (item.pubDate) result.pubDate = formatDate(item.pubDate);
    if (item.description) result.description = { _cdata: item.description };

    return result;
  }

  private mapGuid(guid: RssGuid) {
    if (typeof guid == 'string') return guid;
    return { _attributes: { isPermaLink: guid.isPermaLink ? 'true' : 'false' }, _text: guid.value };
  }
}

function stripProperties<T extends object, K extends keyof T>(obj: T, properties: K[]): Omit<T, K> {
  const result: any = {};

  for (const key of Object.keys(obj) as K[]) {
    if (properties.includes(key)) continue;
    result[key] = obj[key];
  }

  return result;
}

function stripUndefined<T extends object>(object: T): Partial<T> {
  const result: Partial<T> = object;
  for (const key of Object.keys(result)) {
    if (result[key] === undefined || result[key] === null) {
      delete result[key];
    }
  }
  return result;
}

function formatDate(date: Date): string {
  return format(date, 'EEE, dd MMM yyyy HH:mm:ss xx');
}
