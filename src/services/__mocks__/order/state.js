import { fulfillmentState } from "../fulfillment"

const baseState = () => ({
  order_id: "order_default",
  display_id: "12",
  cart_id: "cart_default_id",
  claim_order_id: null,
  swap_id: null,
  line_items: [
    {
      id: "item_default_id_1",
      product_id: "prod_default_id_1",
      variant_id: "variant_default_id_1",
    },
  ],
  fulfillments: [
    {
      id: "ful_default_id_1",
      shippo_order_id: "shippo_order_default_id_1",
      items: ["item_123", "item_321"],
      tracking_links: ["track_01234567890"],
    },
    {
      id: "ful_default_id_2",
      shippo_order_id: "shippo_order_default_id_2",
      items: ["item_11", "item_31"],
      tracking_links: ["track_09876543210"],
    },
  ],
})

const baseStateNew = (display_id) => ({
  order_id: "order_default",
  display_id,
  cart_id: "cart_default_id",
  claim_order_id: null,
  swap_id: null,
  line_items: [
    {
      id: "item_default_id_1",
      product_id: "prod_default_id_1",
      variant_id: "variant_default_id_1",
    },
  ],
})

export const orderState =
  (key) =>
  ({ display_id }) =>
    ({
      default: {
        ...baseStateNew(display_id),
      },
      has_claim: {
        ...baseStateNew(display_id),
        order_id: null,
        claim_order_id: "claim_order_93",
      },
      has_swap: {
        ...baseStateNew(display_id),
        order_id: null,
        swap_id: "swap_93",
      },
    }[key])

// export const orderState = () => ({

//   default: {
//     ...baseState(),
//     // display_id,
//   },
//   claim: {
//     // ...baseState(),
//     // display_id,
//     // order_id: null,
//     // claim_order_id: "claim_order_93",
//   },
//   swap: {
//     ...baseState(),
//     // display_id,
//     order_id: null,
//     swap_id: "swap_93",
//   },
// })
