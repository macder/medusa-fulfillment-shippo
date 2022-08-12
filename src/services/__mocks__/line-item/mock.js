import { lineItemSchema } from "./schema"
import { variantMock } from "../variant"

export const lineItemMock = ({ ...state }) =>
  lineItemSchema({
    ...state,
    variant: variantMock({
      id: state.variant_id,
      product_id: state.product_id,
    }),
  })
