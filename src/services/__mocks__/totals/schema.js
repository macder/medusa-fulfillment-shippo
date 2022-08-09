export const lineItemTotalsSchema = () =>
  Object.freeze({
    unit_price: 1000,
    quantity: 1,
    subtotal: 1000,
    gift_card_total: 0,
    discount_total: 0,
    total: 1000,
    original_total: 1000,
    original_tax_total: 0,
    tax_total: 0,
    tax_lines: [
      {
        id: "litl_",
        created_at: "2022-06-27T08:29:38.631Z",
        updated_at: "2022-06-27T08:29:38.631Z",
        rate: 0,
        name: "default",
        code: "default",
        metadata: null,
        item_id: "item_",
      },
    ],
  })
