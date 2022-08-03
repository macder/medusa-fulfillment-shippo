import {
  shippoOrderTemplate,
  shippoOrderTransactionTemplate,
  transactionTemplate,
} from "./templates/shippo"

export const shippoClientMock = (config) => {
  const orderProps = (object_id) =>
    config(({ shippo_order, ...vals }) => ({
      ...shippo_order,
      object_id,
      order_number: vals.display_id,
      transactions: shippo_order.transactions.map((transaction) =>
        shippoOrderTransactionTemplate(transaction)
      ),
    }))

  const transactionProps = (object_id = null) =>
    config(({ shippo_order }) => ({
      ...shippo_order.transactions.find((ta) => ta.object_id === object_id),
      object_id,
      metadata: `Order ${shippo_order.order_number}`,
      order_number: shippo_order.order_number,
      order_object_id: shippo_order.object_id,
    }))

  return {
    account: {
      address: jest.fn(async () => ({
        results: [
          {
            is_default_sender: true,
            is_default_return: true
          },
          {
            is_default_sender: false,
            is_default_return: false
          }
        ]
      }))
    },
    order: {
      retrieve: jest.fn(async (object_id) =>
        shippoOrderTemplate(orderProps(object_id))
      ),
    },
    transactions: {
      retrieve: jest.fn(async (object_id) =>
        transactionTemplate(transactionProps(object_id))
      ),
      search: jest.fn(async (q) => {
        // TODO: figure this out
        const id = q.replace(/[^0-9]/g, "")
        return []
      }),
    },
  }
}
