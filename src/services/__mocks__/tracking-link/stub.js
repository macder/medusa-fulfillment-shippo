import { trackingLinkSchema } from "./schema"

export const trackingLinkStub = ({ ...state }) =>
  trackingLinkSchema({
    ...state,
  })
