import { serviceGroupSchema } from "./schema"

export const serviceGroupStub = ({ ...state }) =>
  serviceGroupSchema({
    ...state,
  })
