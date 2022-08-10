export const serviceGroupSchema = ({ ...props }) =>
  Object.freeze({
    description: props.description ?? "",
    flat_rate: props.flat_rate ?? "10",
    flat_rate_currency: props.flat_rate_currency ?? "USD",
    free_shipping_threshold_currency:
      props.free_shipping_threshold_currency ?? null,
    free_shipping_threshold_min: props.free_shipping_threshold_min ?? null,
    is_active: props.is_active ?? true,
    name: props.name ?? "Economy USPS Domestic",
    object_id: props.object_id ?? "sg_300",
    rate_adjustment: props.rate_adjustment ?? 0,
    service_levels: [
      Object.freeze({
        account_object_id: "id_11",
        service_level_token: "usps_parcel_select",
      }),
    ],
    type: props.type ?? "LIVE_RATE",
  })
