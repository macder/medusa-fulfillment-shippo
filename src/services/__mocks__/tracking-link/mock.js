import { trackingLinkSchema } from "./schema"

export const trackingLinkMock =
  ({ ...state }) =>
  (id) =>
    trackingLinkSchema({
      id,
      ...state,
    })
