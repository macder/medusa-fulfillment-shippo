export const fulfillmentOptionServiceSchema = ({ ...props }) =>
  Object.freeze({
    id: props.id ?? "shippo-fulfillment-usps_first",
    name: props.name ?? "USPS FC Package",
    token: props.token ?? "usps_first",
    active: props.active ?? true,
    carrier: props.carrier ?? "usps",
    is_group: false,
    metadata: props.metadata ?? "",
    object_id: props.object_id ?? "",
    account_id: props.account_id ?? "shippo_usps_account",
    carrier_id: props.carrier_id ?? "",
    carrier_name: props.carrier_name ?? "USPS",
    supports_return_labels: props.supports_return_labels ?? true,
  })

export const fulfillmentOptionGroupSchema = ({ ...props }) =>
  Object.freeze({
    id: props.id ?? "shippo-fulfillment-11",
    name: props.name ?? "Live Rate 1",
    type: props.type ?? "LIVE_RATE",
    is_group: true,
    flat_rate: props.flat_rate ?? "10",
    is_active: props.active ?? true,
    object_id: props.object_id ?? "",
    description: props.description ?? "",
    service_levels: [
      Object.freeze({
        account_object_id: "",
        service_level_token: "usps_parcel_select",
      }),
    ],
    rate_adjustment: 0,
    flat_rate_currency: "USD",
    free_shipping_threshold_min: null,
    free_shipping_threshold_currency: null,
  })
