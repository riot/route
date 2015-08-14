# Router

Router is a generic tool to take care of the URL and the back button. It's the smallest implementation you can find and it works on all browsers including IE9. It can do the following:

1. Change the hash part of the URL
2. Notify when the hash changes
3. Study the current hash

You can place routing logic everywhere; in custom tags or non-UI modules. Some application frameworks make the router a central element that dispatches work to the other pieces of the application. Some take a milder approach where URL events are like keyboard events, not affecting the overall architecture.

Every browser application needs routing since there is always an URL in the location bar.
