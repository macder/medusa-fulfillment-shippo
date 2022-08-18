import { MedusaError } from "medusa-core-utils"

const base = (type) => (msg) => new MedusaError(type, msg)
const msg = (key) =>
  ({
    not_found:
      (branch) =>
      ([parent, id]) =>
        `${branch} for ${parent} with id: ${id} not found`,
  }[key])

const notFound = base(MedusaError.Types.NOT_FOUND)(msg("not_found"))

const errorHelper = (key) =>
  ({
    fulfillment: {
      not_found: ([parent, id]) => notFound("Fulfillment")([parent, id]),
    },
  }[key])

/* @experimental */
export default errorHelper
