import { MedusaError } from "medusa-core-utils"

const base = (type) => (msg) => new MedusaError(type, msg)
const msg = (key) =>
  ({
    not_found:
      (entity) =>
      ([parent, id]) =>
        `${entity} for ${parent} with id: ${id} not found`,
  }[key])

const notFound =
  (entity) =>
  ([parent, id]) =>
    base(MedusaError.Types.NOT_FOUND)(msg("not_found")(entity)([parent, id]))

const errorHelper = (entity) =>
  ({
    [entity]: {
      not_found_for: ([parent, id]) => notFound(entity)([parent, id]),
    },
  }[entity])

/* @experimental */
export default errorHelper
