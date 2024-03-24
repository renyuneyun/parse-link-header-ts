# parse-link-header-ts

This code base is based on https://github.com/sota1235/parse-link-header.

Big thanks for thlorenz and sota1235 :pray:

## What is this?

This is a TypeScript library to parse the `Link` header as defined in [RFC 5988](https://tools.ietf.org/html/rfc5988).

### Why this fork?

- Support `base` when encounting relative IRIs
- Support multiple IRIs sharing the same `rel`

> When energy allowed, I'll try to create PRs to the upstream.

## Concepts

- Written in TypeScript
- No dependencies

## Usage

Install via:

```
npm i @renyuneyun/parse-link-header-ts
```

Then use it similar to the following in your code:

```
import parseLinkHeader from '@renyuneyun/parse-link-header-ts';

...

resp = await fetch(urlObject);
const linkHeader = resp.headers.get('Link');
const base = 'https://optional.base.url'
const parsedLinkHeader = parseLinkHeader(linkHeader, base);

console.log(parsedLinkHeader['type'])

// You'll get an array of objects each representing one link under this `rel` (`type`, in the example)
```

## License

[MIT License](./LICENSE)