import { fulfillmentSchema, fulfillmentItemSchema } from "./schema"

export const fulfillmentMock = (foreignKeys) => (items) => (id) =>
  fulfillmentSchema({
    id,
    ...foreignKeys,
    items: items.map((item_id) =>
      fulfillmentItemSchema({
        item_id,
        fulfillment_id: id,
        quantity: 2,
      })
    ),
  })
