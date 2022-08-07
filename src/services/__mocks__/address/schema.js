export const addressSchema = ({ ...props }) =>
  Object.freeze({
    id: props?.id ?? "addr_01234567890",
    customer_id: null,
    company: "",
    first_name: props?.is_empty ? null : "Fname",
    last_name: props?.is_empty ? null : "Lname",
    address_1: props?.is_empty ? null : "123 Street Rd.",
    address_2: props?.is_empty ? null : "",
    city: props?.is_empty ? null : "City",
    country_code: props?.is_empty ? null : "us",
    province: props?.is_empty ? null : "CA",
    postal_code: props?.is_empty ? null : "12345",
    phone: props?.is_empty ? null : "(123) 456-7890",
    metadata: null,
  })
