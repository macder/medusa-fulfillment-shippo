import { fulfillmentSchema, fulfillmentItemSchema } from "./schema"
import { trackingLinkSchema } from "../tracking-link"

export const fulfillmentMock = ({ ...state }) =>
  fulfillmentSchema({
    ...state,
    items: state.items.map((item_id) =>
      fulfillmentItemSchema({
        item_id,
        fulfillment_id: state.id,
        quantity: 2,
      })
    ),
    tracking_links: state.tracking_links.map((track) =>
      trackingLinkSchema({
        tracking_number: track,
        fulfillment_id: state.id,
      })
    ),
  })
