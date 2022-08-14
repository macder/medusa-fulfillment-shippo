import { liveRateSchema } from "./schema"

export const liveRateStub = ({ ...state }) =>
  liveRateSchema({
    ...state,
  })
