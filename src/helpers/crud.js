export const retrieve =
  (service) =>
  ({ ...args } = {}) =>
  (id) =>
    service.retrieve(id, args)
