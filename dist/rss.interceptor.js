"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RssInterceptor = void 0;
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const rxjs_1 = require("rxjs");
const xml_js_1 = require("xml-js");
const defaultProtocolExtractor = host => host.getRequest().protocol;
let RssInterceptor = class RssInterceptor {
    constructor(protocolExtractor = defaultProtocolExtractor) {
        this.protocolExtractor = protocolExtractor;
    }
    intercept(context, next) {
        return next.handle().pipe((0, rxjs_1.map)((channel) => {
            const response = context.switchToHttp().getResponse();
            const request = context.switchToHttp().getRequest();
            const protocol = this.protocolExtractor(context.switchToHttp());
            const url = `${protocol}://${request.headers.host}${request.url}`;
            const obj = {
                rss: {
                    _attributes: { version: '2.0', 'xmlns:atom': 'http://www.w3.org/2005/Atom' },
                    channel: Object.assign(Object.assign({}, this.mapChannel(channel, url)), { item: channel.items.map(item => this.mapItem(item)) }),
                },
            };
            response.header('Content-Type', 'application/rss+xml');
            return (0, xml_js_1.js2xml)(obj, { compact: true });
        }));
    }
    mapChannel(channel, requestUrl) {
        var _a, _b;
        const result = Object.assign(Object.assign({}, stripProperties(channel, ['items'])), { 'atom:link': { _attributes: { href: requestUrl, rel: 'self', type: 'application/rss+xml' } } });
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
            result.image = Object.assign(Object.assign({}, channel.image), { title: (_a = channel.image.title) !== null && _a !== void 0 ? _a : channel.title, link: (_b = channel.image.link) !== null && _b !== void 0 ? _b : channel.link });
        }
        return result;
    }
    mapCategory(categories) {
        return categories.map(category => {
            if (typeof category == 'string') {
                return category;
            }
            return { _attributes: { domain: category.domain }, _text: category.name };
        });
    }
    mapItem(rawItem) {
        const item = stripUndefined(rawItem);
        const result = Object.assign({}, item);
        if (item.guid)
            result.guid = this.mapGuid(item.guid);
        if (item.pubDate)
            result.pubDate = formatDate(item.pubDate);
        if (item.description)
            result.description = { _cdata: item.description };
        return result;
    }
    mapGuid(guid) {
        if (typeof guid == 'string')
            return guid;
        return { _attributes: { isPermaLink: guid.isPermaLink ? 'true' : 'false' }, _text: guid.value };
    }
};
RssInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function])
], RssInterceptor);
exports.RssInterceptor = RssInterceptor;
function stripProperties(obj, properties) {
    const result = {};
    for (const key of Object.keys(obj)) {
        if (properties.includes(key))
            continue;
        result[key] = obj[key];
    }
    return result;
}
function stripUndefined(object) {
    const result = object;
    for (const key of Object.keys(result)) {
        if (result[key] === undefined || result[key] === null) {
            delete result[key];
        }
    }
    return result;
}
function formatDate(date) {
    return (0, date_fns_1.format)(date, 'EEE, dd MMM yyyy HH:mm:ss xx');
}
//# sourceMappingURL=rss.interceptor.js.map