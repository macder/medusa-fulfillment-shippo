export const makeArrayOfMocks = (mockFn, count, args = {}) =>
  [...Array(count).keys()].map((e) => mockFn(args))
