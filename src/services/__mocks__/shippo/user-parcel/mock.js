import { userParcelSchema } from "./schema"

export const userParcelMock = ({ ...state }) =>
  userParcelSchema({
    ...state,
  })
