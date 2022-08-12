import { variantSchema } from "./schema"
import { productSchema } from "../product"

export const variantMock = ({ id, product_id }) =>
  variantSchema({
    id,
    product_id,
    product: productSchema({
      id: product_id,
    }),
  })
