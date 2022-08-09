export const trackingLinkSchema = ({ ...props }) =>
  Object.freeze({
    id: props.id ?? "track_1234",
    url: props?.url ?? "https://tools.usps.com/",
    tracking_number: props?.tracking_number ?? "92055901755477000000000015",
    fulfillment_id: props.fulfillment_id,
  })
