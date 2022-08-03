export const addressTemplate = ({ ...props }) =>
  Object.freeze({
    id: "addr_01234567890",
    customer_id: null,
    company: "",
    first_name: props.nulled ?? "Fname",
    last_name: props.nulled ?? "Lname",
    address_1: props.nulled ?? "123 Street Rd.",
    address_2: props.nulled ?? "",
    city: props.nulled ?? "City",
    country_code: props.nulled ?? "us",
    province: props.nulled ?? "CA",
    postal_code: props.nulled ?? "12345",
    phone: props.nulled ?? "(123) 456-7890",
    metadata: null,
  })
