const PARSE_LINK_HEADER_MAXLEN = 2000;

interface RawLink {
  url: string;
  [key: string]: string;
}

interface Link extends RawLink {
  rel: string;
}

export type Result = Record<string, Link[]>;

function hasRel(link: null | Record<string, string>): link is Link {
  if (link === null) {
    return false;
  }

  return link.rel != null;
}

function intoRels(acc: Result, link: Link) {
  function splitRel(rel: string) {
    if (!(rel in acc)) {
      acc[rel] = [];
    }
    acc[rel].push({ ...link, ...{ rel } });
  }

  link.rel.split(/\s+/).forEach(splitRel);

  return acc;
}

function createObjects(acc: Record<string, string>, p: string) {
  // rel="next" => 1: rel 2: next
  const m = p.match(/\s*(.+)\s*=\s*"?([^"]+)"?/);
  if (m) acc[m[1]] = m[2];
  return acc;
}

function parseLink(link: string, base?: string): RawLink | null {
  const m = link.match(/<?([^>]*)>(.*)/);

  if (m === null) {
    throw new Error('Invalid link header');
  }

  const linkUrl = m[1];
  const parts = m[2].split(';');
  const parsedUrl = new URL(linkUrl, base);
  const qry: Record<string, string> = {};

  for (const [key, value] of parsedUrl.searchParams) {
    qry[key] = value;
  }

  parts.shift();

  let info = parts.reduce<Record<string, string>>(createObjects, {});

  info = { ...qry, ...info, url: linkUrl };
  return info as RawLink;
}

function checkHeader(linkHeader: string): void {
  if (linkHeader.length > PARSE_LINK_HEADER_MAXLEN) {
    throw new Error(
      `Input string too long, it should be under ${PARSE_LINK_HEADER_MAXLEN} characters.`
    );
  }
}

export default function (linkHeader: string, base?: string): Result {
  if (linkHeader === '') {
    throw new Error('linkHeader is empty');
  }

  checkHeader(linkHeader);

  return linkHeader
    .split(/,\s*</)
    .map((link) => parseLink(link, base))
    .filter<Link>(hasRel)
    .reduce(intoRels, {});
}