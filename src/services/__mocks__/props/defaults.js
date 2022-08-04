export const defaults = (fn) =>
  fn({
    cart_id: "cart_01234567890",
    order_id: "order_01234567890",
    display_id: "11",
    claim_id: null,
    swap_id: null,
    shipping_address: true,
    cart_has_items: true,
    fulfillments: [
      {
        id: "ful_01234567890",
        order_id: "order_01234567890",
        shippo_order_id: "shippo_order_01234567890",
        items: [
          {
            item_id: "item_01234567890",
          },
        ],
      },
      {
        id: "ful_09876543210",
        order_id: "order_01234567890",
        shippo_order_id: "shippo_order_09876543210",
        items: [
          {
            item_id: "item_09876543210",
          },
        ],
      },
    ],

    items: [
      {
        id: "item_01234567890",
        variant: "variant_01234567890",
        product: "prod_01234567890",
      },
      {
        id: "item_09876543210",
        variant: "variant_09876543210",
        product: "prod_09876543210",
      },
    ],
    shippo_orders: [
      {
        object_id: "shippo_order_01234567890",
        order_number: "11",
        transactions: [
          {
            object_id: "transaction_01234567890",
            tracking_number: "track_01234567890",
          },
          {
            object_id: "transaction_01234567890_return",
            tracking_number: "track_09876543210",
          },
        ],
      },
      {
        object_id: "shippo_order_09876543210",
        order_number: "11 (replace)",
        transactions: [
          {
            object_id: "transaction_09876543210",
            tracking_number: "track_01234567890",
          },
          {
            object_id: "transaction_09876543210_return",
            tracking_number: "track_09876543210",
          },
        ],
      },
    ],
    transactions: [
      {
        object_id: "transaction_01234567890",
        tracking_number: "track_01234567890",
        shippo_order_id: "shippo_order_01234567890",
        metadata: "Order 11",
      },
      {
        object_id: "transaction_01234567890_return",
        tracking_number: "track_01234567890",
        shippo_order_id: "shippo_order_01234567890",
        metadata: "Order 11",
        is_return: true,
      },
      {
        object_id: "transaction_09876543210",
        tracking_number: "track_09876543210",
        shippo_order_id: "shippo_order_09876543210",
        metadata: "Order 11 (replace)",
      },
      {
        object_id: "transaction_09876543210_return",
        tracking_number: "track_09876543210",
        shippo_order_id: "shippo_order_09876543210",
        metadata: "Order 11 (replace)",
        is_return: true,
      },
    ],
    shipping_options: [
      {
        id: "so_01234567890",
        name: "Express Shipping",
        data: {
          name: "Express Shipping USA",
          type: "LIVE_RATE",
        },
      },
      {
        id: "so_09876543210",
        name: "USPS Priority",
        data: {
          name: "USPS Priority",
        },
      },
    ],
  })
