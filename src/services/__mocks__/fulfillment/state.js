export const fulfillmentState = (key) =>
  ({
    no_shippo_order: {
      id: "ful_no_shippo_order",
      // shippo_order_id: "shippo_order_no_transactions",
      items: ["item_123", "item_321"],
      tracking_links: [],
    },
    has_shippo_order: {
      id: "ful_has_shippo_order",
      shippo_order_id: "shippo_order_no_transactions",
      items: ["item_123", "item_321"],
      tracking_links: [],
    },
    no_transaction: {
      id: "ful_no_transactions",
      shippo_order_id: "shippo_order_no_transactions",
      items: ["item_123", "item_321"],
      tracking_links: [],
    },

    has_transaction_for_label: {
      id: "ful_has_transaction_for_label",
      shippo_order_id: "shippo_order_has_transaction_for_label",
      items: ["item_123", "item_321"],
      tracking_links: ["track_label_01234567890"],
    },

    has_transaction_for_label_with_return: {
      id: "ful_has_transaction_for_label_and_return_label",
      shippo_order_id:
        "shippo_order_has_transaction_for_label_and_return_label",
      items: ["item_123", "item_321"],
      tracking_links: [
        "track_label_01234567890",
        "track_return_label_01234567890",
      ],
    },
  }[key])
