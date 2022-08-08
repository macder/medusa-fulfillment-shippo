import { shippoOrderMock } from "./shippo/order"
import { shippoTransactionMock, shippoTransactionExtendedMock } from "./shippo/transaction"

export const shippoClientMock = ({ ...state }) => {

  const order = shippoOrderMock(state.order)
  const transaction = shippoTransactionMock(state.transaction)

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
      retrieve: jest.fn(async (object_id) => order(object_id)),

      packingslip: jest.fn(async () => ({
        expires: "",
        slip_url: "https://shippo-delivery.net",
        created: "",
      })),
    },
    transaction: {
      retrieve: jest.fn(async (object_id) => transaction(object_id)),

      // search: jest.fn(async (q) => {
      //   const id = q.replace(/[^0-9]/g, "")
      //   const transactions = config(({ transactions }) => transactions)
      //   return {
      //     results: transactions.map((ta) =>
      //       transactionExtendedTemplate(transactionProps(ta.object_id))
      //     ),
      //   }
      // }),
    },
    // userparceltemplates: {
    //   list: jest.fn(async () => ({
    //     results: userParcelProps().map((props) => userParcelTemplate(props)),
    //   })),
    // },
  }
}
