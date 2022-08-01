import {
  shippoOrderTemplate,
  shippoOrderTransactionTemplate,
} from "./templates/shippo"

export const shippoNew = (config) => {
  const orderProps = (object_id) =>
    config(({ shippo_order, ...vals }) => ({
      ...shippo_order,
      object_id,
      order_number: vals.display_id,
      transactions: shippo_order.transactions.map((transaction) =>
        shippoOrderTransactionTemplate(transaction)
      ),
    }))

  return jest.fn(async () => ({
    order: {
      retrieve: jest.fn(async (object_id) =>
        shippoOrderTemplate(orderProps(object_id))
      ),
    },
  }))
}
