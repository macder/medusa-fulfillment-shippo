/** makeArrayOfMocks
 * @param {function} mockFn - function that returns data object(s)
 * @param {int} count - array length
 * @param {object} [args] - params for mockFn
 * @return {array} - array of result objects from mockFn
 */
export const makeArrayOfMocks = (mockFn, count, args = {}) =>
  [...Array(count).keys()].map(() => mockFn(args))
