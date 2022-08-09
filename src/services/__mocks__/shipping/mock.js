import { shippingOptionSchema } from "./schema"
import {
  fulfillmentOptionServiceSchema,
  fulfillmentOptionGroupSchema,
} from "../fulfillment-option"

export const shippingOptionMock =
  ({ ...state }) =>
  (id = null) =>
    shippingOptionSchema({
      id,
      ...state,
      data: state.data.is_group
        ? fulfillmentOptionGroupSchema({ ...state.data })
        : fulfillmentOptionServiceSchema({ ...state.data }),
    })
