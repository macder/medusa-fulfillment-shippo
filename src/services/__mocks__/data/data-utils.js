/** makeArrayOfMocks
 * @param {function} mockFn - function that returns data object(s)
 * @param {int} count - array length
 * @param {object} [args] - params for mockFn
 * @return {array} - array of [mockFn] objects
 */
export const makeArrayOfMocks = (mockFn, count, args = {}) =>
  [...Array(count).keys()].map(() => mockFn(args))

/** toSnakeCase
 * @param {string} str - string to snake case
 * @return {string} - snake case string
 */
export const toSnakeCase = (str) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join("_")
