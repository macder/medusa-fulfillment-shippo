export const makeArrayOfMocks = (mockFn, count) =>
  [...Array(count).keys()].map((e) => mockFn())
