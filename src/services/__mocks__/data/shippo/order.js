import { faker } from "@faker-js/faker"
import { makeArrayOf } from "../data-utils"

const order =
  (...[object_id, order_number, order_status = "PAID"]) =>
  (transactions) =>
    Object.freeze({
      object_id,
      order_number,
      order_status,
      errors: [],
      validation_status: null,
      placed_at: "",
      object_owner: "",
      to_address: {},
      from_address: null,
      shop_app: "Shippo",
      weight: "500.00",
      weight_unit: "g",
      transactions: transactions(),
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

const transaction = (...[object_id, tracking_number]) =>
  Object.freeze({
    object_id,
    object_status: "SUCCESS",
    label_url: "https://deliver.goshippo.com/",
    tracking_number,
  })

export const mockMiniTransaction = ({ object_id, tracking_number }) =>
  transaction(object_id, tracking_number)

export const mockShippoOrder = ({ object_id, order_number, order_status }) =>
  order(object_id, order_number, order_status)
