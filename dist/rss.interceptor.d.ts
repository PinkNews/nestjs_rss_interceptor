import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Observable } from 'rxjs';
export type RssHour = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;
export type RssDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type RssGuid = string | {
    isPermaLink?: boolean;
    value: string;
};
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
export declare class RssInterceptor implements NestInterceptor {
    private readonly protocolExtractor;
    constructor(protocolExtractor?: ProtocolExtractor);
    intercept(context: ExecutionContext, next: CallHandler<RssChannel>): Observable<any> | Promise<Observable<any>>;
    private mapChannel;
    private mapCategory;
    private mapItem;
    private mapGuid;
}
