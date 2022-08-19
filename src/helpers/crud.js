export const retrieve =
  (service) =>
  (id) =>
  ({ ...args } = {}) =>
    service.retrieve(id, args)
