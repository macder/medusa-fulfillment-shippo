import { transactionSchema, transactionExtendedSchema } from "./schema"

export const shippoTransactionStub = ({ ...state }) =>
  transactionSchema({
    ...state,
  })

export const shippoTransactionExtendedStub = ({ ...state }) =>
  transactionExtendedSchema({
    ...state,
  })
