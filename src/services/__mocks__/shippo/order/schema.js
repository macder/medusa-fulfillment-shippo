export const shippoOrderSchema = (props) =>
  Object.freeze({
    object_id: props.object_id,
    order_number: props.order_number,
    order_status: props?.order_status ?? "PAID",
    errors: [],
    validation_status: null,
    placed_at: "",
    object_owner: "",
    to_address: {},
    from_address: null,
    shop_app: "Shippo",
    weight: "500.00",
    weight_unit: "g",
    transactions: props.transactions,
    total_tax: "3.20",
    total_price: "35.22",
    subtotal_price: "24.00",
    currency: "USD",
    shipping_method: "Standard Shipping - USD",
    shipping_cost: "8.02",
    shipping_cost_currency: "USD",
    line_items: [],
    notes: "Parcel Template: 2 Coffee mugs TEST",
    test: true,
  })

export const shippoOrderTransactionSchema = (props) =>
  Object.freeze({
    object_id: props.object_id,
    object_status: "SUCCESS",
    label_url: "https://deliver.goshippo.com/",
    tracking_number: props?.tracking_number,
  })
