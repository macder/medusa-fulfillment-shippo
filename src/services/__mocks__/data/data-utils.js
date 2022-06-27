/** makeArrayOfMocks
 * @param {function} mockFn - the data mock function to use
 * @param {int} count - array length
 * @param {object} [args] - params for mockFn
 * @return {array} - array of result objects from mockFn
 */
export const makeArrayOfMocks = (mockFn, count, args = {}) =>
  [...Array(count).keys()].map(() => mockFn(args))
