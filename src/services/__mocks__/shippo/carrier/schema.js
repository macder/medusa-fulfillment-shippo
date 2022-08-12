export const carrierAccountSchema = ({ ...props }) =>
  Object.freeze({
    carrier: props?.carrier ?? "usps",
    object_id: props?.object_id ?? "object_id_56",
    account_id: props?.account_id ?? "shippo_usps_account",
    active: props?.active ?? true,
    is_shippo_account: props?.is_shippo_account ?? true,
    metadata: "",
    carrier_name: props?.carrier_name ?? "USPS",
    carrier_images: Object.freeze({
      75: "https://url/img-75.jpg",
      200: "https://url/img-200.jpg",
    }),
    service_levels: props?.service_levels ?? [],
  })

export const carrierServiceLevelSchema = ({ ...props }) =>
  Object.freeze({
    token: props?.token ?? "usps_first",
    name: props?.name ?? "FC Package",
    supports_return_labels: props?.carrier ?? false,
  })
