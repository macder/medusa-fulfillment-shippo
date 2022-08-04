import {
  shippoOrderTemplate,
  shippoOrderTransactionTemplate,
  transactionTemplate,
  transactionExtendedTemplate,
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
      ...transactions.find((ta) => ta.object_id === object_id),
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
      packingslip: jest.fn(async () => ({
        expires: "",
        slip_url: "https://shippo-delivery.net",
        created: "",
      })),
    },
    transaction: {
      retrieve: jest.fn(async (object_id) =>
        transactionTemplate(transactionProps(object_id))
      ),

      search: jest.fn(async (q) => {
        const id = q.replace(/[^0-9]/g, "")
        const transactions = config(({ transactions }) => transactions)
        return {
          results: transactions.map((ta) =>
            transactionExtendedTemplate(transactionProps(ta.object_id))
          ),
        }
      }),
    },
    userparceltemplates: {
      list: jest.fn(async () => ({
        results: userParcelProps().map((props) => userParcelTemplate(props)),
      })),
    },
  }
}
