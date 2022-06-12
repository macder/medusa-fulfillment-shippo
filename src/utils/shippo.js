export const shippoLineItem = (item, price) => ({
  quantity: item.quantity,
  sku: item.variant.sku,
  title: item.variant.product.title,
  ...price,
  weight: item.variant.weight.toString(),
  // weight_unit: WEIGHT_UNIT_TYPE
})

export const shippoAddress = (address, email) => ({
  name: `${address.first_name} ${address.last_name}`,
  company: address.company,
  street1: address.address_1,
  street2: address?.address_2,
  street3: address?.address_3,
  city: address.city,
  state: address.province,
  zip: address.postal_code,
  country: address.country_code.toUpperCase(), // iso2 country code
  phone: address.phone,
  email: email,
  validate: (address.country_code == 'us') ?? true
})
