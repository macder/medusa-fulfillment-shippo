import { fulfillmentSchema, fulfillmentItemSchema } from "./schema"
import { trackingLinkSchema } from "../tracking-link"
import { lineItemStub } from "../line-item"

export const fulfillmentStub = ({ ...state }) =>
  fulfillmentSchema({
    ...state,
    items: state.items.map((fulfillItem) =>
      fulfillmentItemSchema({
        ...fulfillItem,
        ...(fulfillItem.item && {
          item: lineItemStub({ ...state, ...fulfillItem.item }),
        }),
        fulfillment_id: state.id,
      })
    ),
    tracking_links: state.tracking_links.map((track) =>
      trackingLinkSchema({
        tracking_number: track,
        fulfillment_id: state.id,
      })
    ),
  })
