import { serviceGroupSchema } from "./schema"

export const serviceGroupMock = ({ ...state }) =>
  serviceGroupSchema({
    ...state,
  })
