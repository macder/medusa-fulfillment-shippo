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

const errorHelper = (key) =>
  ({
    fulfillment: {
      notFound: ([parent, id]) => notFound("Fulfillment")([parent, id]),
    },
  }[key])

/* @experimental */
export default errorHelper
