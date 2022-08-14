import { userParcelSchema } from "./schema"

export const userParcelStub = ({ ...state }) =>
  userParcelSchema({
    ...state,
  })
