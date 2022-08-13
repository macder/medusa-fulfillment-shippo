import { trackingLinkSchema } from "./schema"

export const trackingLinkStub =
  ({ ...state }) =>
  (id) =>
    trackingLinkSchema({
      id,
      ...state,
    })
