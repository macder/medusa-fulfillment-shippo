import { variantSchema } from "./schema"
import { productSchema } from "../product"

export const variantMock =
  ({ product_id }) =>
  (id) =>
    variantSchema({
      id,
      product_id,
      product: productSchema({
        id: product_id,
      }),
    })
