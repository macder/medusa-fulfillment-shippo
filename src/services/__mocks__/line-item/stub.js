import { lineItemSchema } from "./schema"
import { variantStub } from "../variant"

export const lineItemStub = ({ ...state }) =>
  lineItemSchema({
    ...state,
    variant: variantStub({
      id: state.variant_id,
      product_id: state.product_id,
    }),
  })
