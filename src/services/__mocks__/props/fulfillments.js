const fulfillmentBaseProps =
  (id) =>
  ([...items]) =>
  (shippo_order_id) =>
  (foreignKeys) => ({
    id,
    ...foreignKeys,
    shippo_order_id,
    items: items.map((item_id) => ({ item_id, fulfillment_id: id })),
  })

const fulfillmentSingleItem = fulfillmentBaseProps("ful_single_item")([
  "item_01234567890",
])

const fulfillmentMulitItem = fulfillmentBaseProps("ful_multi_item")([
  "item_01234567890",
  "item_09876543210",
])

export const fulfillmentProps = {
  single_item: ({ shippo_order_id }) => fulfillmentSingleItem(shippo_order_id),
  multi_item: ({ shippo_order_id }) => fulfillmentMulitItem(shippo_order_id),
}
