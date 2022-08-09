import { shippoOrderSchema, shippoOrderTransactionSchema } from "./schema"

export const shippoOrderMock =
  ({ ...state }) =>
  (object_id) =>
    shippoOrderSchema({
      object_id,
      order_number: state.order_number,
      transactions: state.transactions.map((ta) =>
        shippoOrderTransactionSchema(ta)
      ),
    })
