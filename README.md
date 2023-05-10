This adds a `RssInterceptor`, which deals with turning a data blob from your controller to valid rss compliant xml.

Your controller should return a `RssChannel` instance, which mirrors the rss spec https://validator.w3.org/feed/docs/rss2.html.

```
export class RssController {
    @UseInterceptors(RssInterceptor)
    getRss() {
        return {
            title: 'My RSS feed',
            description: 'This is my rss feed',
            link: 'http://example.com/rss',
            items: [
                {
                    title: 'This is item 1 in the feed',
                    description: 'This is longer description of how this is item 1 in the feed',
                    link: 'http://example.com/rss/1',
                },
                {
                    title: 'This is item 2. It's a bit simpler'
                }
            ]
        };
    }
}
```
