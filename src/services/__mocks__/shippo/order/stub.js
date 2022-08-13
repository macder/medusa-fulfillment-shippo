import { shippoOrderSchema, shippoOrderTransactionSchema } from "./schema"

export const shippoOrderStub = ({ ...state }) =>
  shippoOrderSchema({
    ...state,
    transactions: state.transactions.map((ta) =>
      shippoOrderTransactionSchema(ta)
    ),
  })
