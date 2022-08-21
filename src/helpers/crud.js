export const retrieve =
  (service) =>
  ({ ...config } = {}) =>
  (id) =>
    service.retrieve(id, config)
