import { faker } from "@faker-js/faker"

export const makeArrayOf = (mockFn, count) =>
  [...Array(count).keys()].map((e) => mockFn())

export const mockAddress = () => ({
  id: `addr_${faker.database.mongodbObjectId()}`,
  created_at: faker.date.past(),
  updated_at: faker.date.past(),
  deleted_at: null,
  customer_id: faker.database.mongodbObjectId(),
  company: faker.company.companyName(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  address_1: faker.address.streetAddress(),
  address_2: faker.address.secondaryAddress(),
  city: faker.address.cityName(),
  country_code: faker.address.countryCode().toLowerCase(),
  province: faker.address.stateAbbr(),
  postal_code: faker.address.zipCode(),
  phone: faker.phone.phoneNumber(),
  metadata: null,
})

export const mockParcelTemplate = () => ({
  object_id: faker.database.mongodbObjectId(),
  object_owner: faker.internet.email(),
  object_created: faker.date.past(),
  object_updated: faker.date.past(),
  name: faker.random.words(4),
  length: faker.datatype.number({ min: 20, max: 100 }),
  width: faker.datatype.number({ min: 20, max: 100 }),
  height: faker.datatype.number({ min: 20, max: 100 }),
  distance_unit: "cm",
  weight: faker.datatype.number({ min: 200, max: 3000 }),
  weight_unit: "g",
})

// WIP
export const mockProduct = () => ({
  id: `prod_${faker.database.mongodbObjectId()}`,
  created_at: faker.date.past(),
  updated_at: faker.date.past(),
  deleted_at: null,
  title: faker.commerce.productName(),
  subtitle: null,
  description: faker.commerce.productDescription(),
  handle: "coffee-mug",
  is_giftcard: false,
  status: "published",
  thumbnail: "",
  profile_id: faker.database.mongodbObjectId(),
  weight: faker.datatype.number({ min: 200, max: 3000 }),
  length: faker.datatype.number({ min: 20, max: 100 }),
  width: faker.datatype.number({ min: 20, max: 100 }),
  height: faker.datatype.number({ min: 20, max: 100 }),
  hs_code: "HS_CODE_555",
  origin_country: "India",
  mid_code: "555MID_CODE_TEST",
  material: faker.commerce.productMaterial(),
  collection_id: null,
  type_id: null,
  discountable: true,
  external_id: null,
  metadata: null,
})

// WIP
export const mockVariant = () => ({
  id: `variant_${faker.database.mongodbObjectId()}`,
  created_at: faker.date.past(),
  updated_at: faker.date.past(),
  deleted_at: null,
  title: "One Size",
  product_id: `prod_${faker.database.mongodbObjectId()}`,
  sku: "SKU_935611",
  barcode: "123456789012",
  ean: "1234567890123",
  upc: null,
  inventory_quantity: 149,
  allow_backorder: false,
  manage_inventory: true,
  hs_code: "HS_CODE_4321",
  origin_country: "India",
  mid_code: "MID_CODE_858",
  material: faker.commerce.productMaterial(),
  weight: faker.datatype.number({ min: 200, max: 3000 }),
  length: faker.datatype.number({ min: 20, max: 100 }),
  width: faker.datatype.number({ min: 20, max: 100 }),
  height: faker.datatype.number({ min: 20, max: 100 }),
  metadata: null,
  product: {}, // prod_
})

export const mockItem = () => ({
  id: `item_${faker.database.mongodbObjectId()}`,
  created_at: "2022-06-24T18:08:31.058Z",
  updated_at: "2022-06-24T18:10:39.925Z",
  cart_id: `cart_${faker.database.mongodbObjectId()}`,
  order_id: `order_${faker.database.mongodbObjectId()}`,
  swap_id: null,
  claim_order_id: null,
  title: "Medusa Coffee Mug",
  description: "One Size",
  thumbnail: "",
  is_return: false,
  is_giftcard: false,
  should_merge: true,
  allow_discounts: true,
  has_shipping: true,
  unit_price: 1000,
  variant_id: "variant_01G4XYVBYWTVR3WGWFDEGMA7CQ",
  quantity: 2,
  fulfilled_quantity: null,
  returned_quantity: null,
  shipped_quantity: null,
  metadata: {},
  variant: {}, // variant_
  tax_lines: [], // litl_
  adjustments: [],
})

// WIP
export const mockLineItem = () => {
  const id = {
    prod: `prod_${faker.database.mongodbObjectId()}`,
    variant: `variant_${faker.database.mongodbObjectId()}`,
  }

  const lineItem = {
    ...mockItem(),
    variant: {
      ...mockVariant(),
      product_id: id.prod,
      product: {
        ...mockProduct(),
        id: id.prod,
      },
    },
  }

  return lineItem
}

console.log(mockLineItem())
