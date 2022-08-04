export const transactionTemplate = (props) =>
  Object.freeze({
    object_state: props?.state ?? "VALID",
    status: props?.status ?? "SUCCESS",
    object_id: props.object_id,
    rate: "",
    tracking_number: props.tracking_number,
    tracking_status: "UNKNOWN",
    tracking_url_provider: "https://tools.usps.com",
    label_url: "https://deliver.goshippo.com",
    messages: [],
    order: props.tracking_number,
    metadata: props.metadata,
    parcel: "parcel_01234567890",
    billing: {
      payments: [],
    },
  })
