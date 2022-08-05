export const liveRateTemplate = ({ ...props }) => Object.freeze({
  title: props.title, // to match shippingOption.data.name
  description: "",
  amount: props.amount ?? "40",
  currency: props.currency ?? "USD",
  amount_local: props.amount_local ?? "32.25",
  currency_local: props.currency_local ?? "",
  estimated_days: props.estimated_days ?? 2,
})
