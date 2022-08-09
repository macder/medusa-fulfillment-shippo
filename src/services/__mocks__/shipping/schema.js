export const shippingOptionSchema = ({ ...props }) =>
  Object.freeze({
    id: props.id,
    name: props?.name ?? "Standard Shipping",
    provider_id: "shippo",
    price_type: props?.price_type ?? "flat_rate",
    amount: props?.price_type ? null : props?.amount ?? 1000,
    is_return: props?.is_return ?? false,

    data: props.data,

    metadata: null,
    requirements: [],
    price_incl_tax: 0,
    tax_rates: [
      {
        rate: 10,
        name: "default",
        code: "default",
      },
    ],
  })
