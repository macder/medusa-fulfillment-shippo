import { MedusaError } from "medusa-core-utils"

const base = (type) => (msg) => new MedusaError(type, msg)
const msg = (key) =>
  ({
    notFound:
      (entity) =>
      ([parent, id]) =>
        `${entity} for ${parent} with id: ${id} not found`,
  }[key])

const errorHelper = (entity) =>
  ({
    [entity]: {
      notFoundFor: ([parent, id]) =>
        Promise.reject(
          base(MedusaError.Types.NOT_FOUND)(
            msg("notFound")(entity)([parent, id])
          )
        ),
    },
  }[entity])

/* @experimental */
export default errorHelper
