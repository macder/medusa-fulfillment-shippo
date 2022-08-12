import { shippoOrderSchema, shippoOrderTransactionSchema } from "./schema"

export const shippoOrderMock = ({ ...state }) =>
  shippoOrderSchema({
    ...state,
    transactions: state.transactions.map((ta) =>
      shippoOrderTransactionSchema(ta)
    ),
  })
