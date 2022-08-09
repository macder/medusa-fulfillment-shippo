import { fulfillmentSchema, fulfillmentItemSchema } from "./schema"
import { trackingLinkSchema } from "../tracking-link"

export const fulfillmentMock =
  ({ ...state }) =>
  (items, tracking_links = []) =>
  (id) =>
    fulfillmentSchema({
      id,
      ...state,
      items: items.map((item_id) =>
        fulfillmentItemSchema({
          item_id,
          fulfillment_id: id,
          quantity: 2,
        })
      ),
      tracking_links: tracking_links.map((track) =>
        trackingLinkSchema({
          tracking_number: track,
          fulfillment_id: id,
        })
      ),
    })
