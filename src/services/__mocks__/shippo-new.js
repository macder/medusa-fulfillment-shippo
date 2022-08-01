import {
  shippoOrderTemplate,
  shippoOrderTransactionTemplate,
} from "./templates/shippo"

const orderProps = (object_id) =>
  config(({ shippo_order, ...vals }) => ({
    ...shippo_order,
    object_id,
    order_number: vals.display_id,
    transactions: shippo_order.transactions.map((transaction) =>
      shippoOrderTransactionTemplate(transaction)
    ),
  }))

const test = shippoOrderTemplate(orderProps("shippo_order_01234567890"))

const shippo = jest.fn()