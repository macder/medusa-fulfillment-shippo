export const fulfillmentState = (key) =>
  ({
    ful_no_transaction: {
      id: "ful_no_transactions",
      shippo_order_id: "shippo_order_no_transactions",
      items: ["item_123", "item_321"],
      tracking_links: [],
    },

    ful_has_transaction_for_label: {
      id: "ful_has_transaction_for_label",
      shippo_order_id: "shippo_order_has_transaction_for_label",
      items: ["item_123", "item_321"],
      tracking_links: [],
    },

    ful_has_transaction_for_label_with_return: {
      id: "ful_has_transaction_for_label_and_return_label",
      shippo_order_id:
        "shippo_order_has_transaction_for_label_and_return_label",
      items: ["item_123", "item_321"],
      tracking_links: [],
    },
  }[key])
