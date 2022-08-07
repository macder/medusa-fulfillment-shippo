import { lineItemSchema } from "./schema"
import { variantMock } from "../variant"

export const lineItemMock = (foreignKeys) => (product) => (variant) => (id) =>
  lineItemSchema({
    id,
    ...foreignKeys,
    variant_id: variant.id,
    variant: variantMock({ product_id: product.id })(variant.id),
  })
