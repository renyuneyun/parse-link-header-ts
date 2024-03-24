import parse from './index';

test('parsing a proper link header with next and last', () => {
  const link =
    '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100>; rel="next", ' +
    '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100>; rel="last"';
  const result = parse(link);
  expect(result).toEqual({
    next: [{
      client_id: '1',
      client_secret: '2',
      page: '2',
      per_page: '100',
      rel: 'next',
      url: 'https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100',
    }],
    last: [{
      client_id: '1',
      client_secret: '2',
      page: '3',
      per_page: '100',
      rel: 'last',
      url: 'https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100',
    }],
  });
});

test('handles unquoted relationships', () => {
  const link =
    '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100>; rel=next, ' +
    '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100>; rel=last';
  const result = parse(link);
  expect(result).toEqual({
    next: [{
      client_id: '1',
      client_secret: '2',
      page: '2',
      per_page: '100',
      rel: 'next',
      url: 'https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100',
    }],
    last: [{
      client_id: '1',
      client_secret: '2',
      page: '3',
      per_page: '100',
      rel: 'last',
      url: 'https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100',
    }],
  });
});

test('parsing a proper link header with next, prev and last', () => {
  const linkHeader =
    '<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel="next", ' +
    '<https://api.github.com/user/9287/repos?page=1&per_page=100>; rel="prev", ' +
    '<https://api.github.com/user/9287/repos?page=5&per_page=100>; rel="last"';

  const result = parse(linkHeader);

  expect(result).toEqual({
    next: [{
      page: '3',
      per_page: '100',
      rel: 'next',
      url: 'https://api.github.com/user/9287/repos?page=3&per_page=100',
    }],
    prev: [{
      page: '1',
      per_page: '100',
      rel: 'prev',
      url: 'https://api.github.com/user/9287/repos?page=1&per_page=100',
    }],
    last: [{
      page: '5',
      per_page: '100',
      rel: 'last',
      url: 'https://api.github.com/user/9287/repos?page=5&per_page=100',
    }],
  });
});

test('parsing an empty link header', () => {
  const linkHeader = '';
  expect(() => parse(linkHeader)).toThrow('linkHeader is empty');
});

test('parsing a proper link header with next and a link without rel', () => {
  const linkHeader =
    '<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel="next", ' +
    '<https://api.github.com/user/9287/repos?page=1&per_page=100>; pet="cat", ';
  const result = parse(linkHeader);

  expect(result).toEqual({
    next: [{
      page: '3',
      per_page: '100',
      rel: 'next',
      url: 'https://api.github.com/user/9287/repos?page=3&per_page=100',
    }],
  });
});

test('parsing a proper link header with next and properties besides rel', () => {
  const linkHeader =
    '<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel="next"; hello="world"; pet="cat"';
  const result = parse(linkHeader);

  expect(result).toEqual({
    next: [{
      page: '3',
      per_page: '100',
      rel: 'next',
      hello: 'world',
      pet: 'cat',
      url: 'https://api.github.com/user/9287/repos?page=3&per_page=100',
    }],
  });
});

test('parsing a proper link header with a comma in the url', () => {
  const linkHeader =
    '<https://imaginary.url.notreal/?name=What,+me+worry>; rel="next";';

  const result = parse(linkHeader);

  expect(result).toEqual({
    next: [{
      rel: 'next',
      name: 'What, me worry',
      url: 'https://imaginary.url.notreal/?name=What,+me+worry',
    }],
  });
});

test('parsing a proper link header with a multi-word rel', () => {
  const linkHeader =
    '<https://imaginary.url.notreal/?name=What,+me+worry>; rel="next page";';

  const result = parse(linkHeader);

  expect(result).toEqual({
    page: [{
      rel: 'page',
      name: 'What, me worry',
      url: 'https://imaginary.url.notreal/?name=What,+me+worry',
    }],
    next: [{
      rel: 'next',
      name: 'What, me worry',
      url: 'https://imaginary.url.notreal/?name=What,+me+worry',
    }],
  });
});

test('parsing a proper link header with matrix parameters', () => {
  const linkHeader =
    '<https://imaginary.url.notreal/segment;foo=bar;baz/item?name=What,+me+worry>; rel="next";';
  const result = parse(linkHeader);

  expect(result).toEqual({
    next: [{
      rel: 'next',
      name: 'What, me worry',
      url: 'https://imaginary.url.notreal/segment;foo=bar;baz/item?name=What,+me+worry',
    }],
  });
});

test('parsing a proper link header where multiple values share same rel', () => {
  const linkHeader =
    '<http://www.w3.org/ns/pim/space#Storage>; rel="type", ' + 
    '<http://www.w3.org/ns/ldp#Container>; rel="type", ' +
    '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type", ' +
    '<http://www.w3.org/ns/ldp#Resource>; rel="type", ' + 
    '<https://a.social-linked-data.pod/.acl>; rel="acl"';
  const result = parse(linkHeader);

  expect(result).toEqual({
    type: [{
      rel: 'type',
      url: 'http://www.w3.org/ns/pim/space#Storage',
    }, {
      rel: 'type',
      url: 'http://www.w3.org/ns/ldp#Container',
    }, {
      rel: 'type',
      url: 'http://www.w3.org/ns/ldp#BasicContainer',
    }, {
      rel: 'type',
      url: 'http://www.w3.org/ns/ldp#Resource',
    }],
    acl: [{
      rel: 'acl',
      url: 'https://a.social-linked-data.pod/.acl',
    }],
  });
});