import {
  shippoOrderTemplate,
  shippoOrderTransactionTemplate,
  transactionTemplate,
  userParcelTemplate,
} from "./templates/shippo"

export const shippoClientMock = (config) => {
  const orderProps = (object_id) =>
    config(({ shippo_orders, ...vals }) => {
      const order = shippo_orders.find((order) => order.object_id === object_id)
      return {
        ...order,
        object_id,
        transactions: order.transactions.map((transaction) =>
          shippoOrderTransactionTemplate(transaction)
        ),
      }
    })

  const transactionProps = (object_id = null) =>
    config(({ transactions }) => ({
      ...transactions.find(ta => ta.object_id === object_id)
    }))

  const userParcelProps = () =>
    config(({ user_parcel_templates }) => user_parcel_templates)

  return {
    account: {
      address: jest.fn(async () => ({
        results: [
          {
            is_default_sender: true,
            is_default_return: true,
          },
          {
            is_default_sender: false,
            is_default_return: false,
          },
        ],
      })),
    },
    order: {
      retrieve: jest.fn(async (object_id) =>
        shippoOrderTemplate(orderProps(object_id))
      ),
    },
    transaction: {
      retrieve: jest.fn(async (object_id) =>
        transactionTemplate(transactionProps(object_id))
      ),
      search: jest.fn(async (q) => {
        // TODO: figure this out
        const id = q.replace(/[^0-9]/g, "")
        return []
      }),
    },
    userparceltemplates: {
      list: jest.fn(async () => ({
        results: userParcelProps().map((props) => userParcelTemplate(props)),
      })),
    },
  }
}
