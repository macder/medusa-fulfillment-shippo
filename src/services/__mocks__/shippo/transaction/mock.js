import { transactionSchema, transactionExtendedSchema } from "./schema"

export const shippoTransactionMock =
  ({ ...state }) =>
  (object_id) =>
    transactionSchema({
      ...state,
      object_id,
    })

export const shippoTransactionExtendedMock =
  ({ ...state }) =>
  (object_id) =>
    transactionExtendedSchema({
      ...state,
      object_id,
    })
