import { liveRateSchema } from "./schema"

export const liveRateMock = ({ ...state }) =>
  liveRateSchema({
    ...state,
  })
