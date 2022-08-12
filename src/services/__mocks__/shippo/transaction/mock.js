import { transactionSchema, transactionExtendedSchema } from "./schema"

export const shippoTransactionMock = ({ ...state }) =>
  transactionSchema({
    ...state,
  })

export const shippoTransactionExtendedMock = ({ ...state }) =>
  transactionExtendedSchema({
    ...state,
  })
