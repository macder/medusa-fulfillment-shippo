import {
  productLineItem,
  shippoAddress,
  shippoLineItem,
  shippoOrder,
} from "../formatters"

const lineItem = {
  title: "Line Item Title",
  description: "One Size",
  unit_price: 1000,
  quantity: 6,
  variant: {
    title: "Variant Title",
    sku: "SKU_935611",
    barcode: "123456789012",
    ean: "1234567890123",
    upc: null,
    hs_code: "HS_CODE_4321",
    origin_country: "Canada",
    mid_code: "MID_CODE_858",
    material: "Ceramic",
    weight: 400,
    length: 10,
    height: 14,
    width: 10,
    product: {
      title: "Product Title",
      subtitle: null,
      description: "Product description",
      weight: 500,
      length: 10,
      height: 14,
      width: 10,
      hs_code: "HS_CODE_555",
      origin_country: "USA",
      mid_code: "555MID_CODE_TEST",
      material: null,
    },
  },
}

const address = {
  company: "",
  first_name: "Firstname",
  last_name: "Lastname",
  address_1: "address1",
  address_2: "",
  address_3: "",
  city: "city",
  country_code: "ca",
  province: "XX",
  postal_code: "A1A 1A1",
  phone: "123-456-7890",
  metadata: null,
}

const order = {
  id: "order_01G69PZYKRK39SGE255RBWYFVB",
  region: {
    name: "Canada",
    currency_code: "cad",
  },
  fulfillments: [],
  shipping_address: address,
  shipping_methods: [
    {
      shipping_option: {
        name: "Expedited Shipping",
      },
    },
  ],
  created_at: "2022-06-24T01:59:58.247Z",
  display_id: 124,
  email: "test1@test.com",
  currency_code: "usd",
  tax_rate: null,
  metadata: {
    shippo_parcel_template: "123abc123abc123abc123abc",
  },
  subtotal: 3000,
  shipping_total: 2357,
  discount_total: 0,
  tax_total: 0,
  gift_card_total: 0,
  total: 5357,
}

const lineItems = [
  {
    title: "Medusa Coffee Mug",
    variant_title: "One Size",
    quantity: 3,
    total_price: "10",
    currency: "USD",
    sku: "SKU_935611",
    weight: "500",
    weight_unit: "g",
    manufacture_country: "Canada",
  },
]

const parcel = {
  object_id: "123abc123abc123abc123abc",
  name: "Package for 4 Coffee Mugs",
  length: "20",
  width: "20",
  height: "14",
  distance_unit: "cm",
  weight: null,
  weight_unit: null,
}

test("Formatter: productLineItem", () => {
  expect(productLineItem(lineItem, "test@test.com")).toStrictEqual({
    product_title: "Product Title",
    variant_title: "Variant Title",
    weight: 400,
    length: 10,
    height: 14,
    width: 10,
    origin_country: "Canada",
    material: "Ceramic",
    sku: "SKU_935611",
    barcode: "123456789012",
    ean: "1234567890123",
    upc: null,
    hs_code: "HS_CODE_4321",
    mid_code: "MID_CODE_858",
  })
})

test("Formatter: shippoLineItem", () => {
  expect(shippoLineItem(lineItem, 5000, "cad")).toStrictEqual({
    title: "Product Title",
    variant_title: "Variant Title",
    quantity: 6,
    total_price: "50",
    currency: "CAD",
    sku: "SKU_935611",
    weight: "400",
    weight_unit: "g",
    manufacture_country: "Canada",
  })
})

test("Formatter: shippoAddress", async () => {
  expect(await shippoAddress(address, "test@test.com")).toStrictEqual({
    name: "Firstname Lastname",
    company: "",
    street1: "address1",
    street2: "",
    street3: "",
    city: "city",
    state: "XX",
    zip: "A1A 1A1",
    country: "CA",
    phone: "123-456-7890",
    email: "test@test.com",
    validate: false,
  })
})

test("Formatter: shippoOrder", async () => {
  expect(await shippoOrder(order, lineItems, parcel)).toStrictEqual({
    order_number: 124,
    order_status: "PAID",
    to_address: {
      name: "Firstname Lastname",
      company: "",
      street1: "address1",
      street2: "",
      street3: "",
      city: "city",
      state: "XX",
      zip: "A1A 1A1",
      country: "CA",
      phone: "123-456-7890",
      email: "test1@test.com",
      validate: false,
    },
    placed_at: "2022-06-24T01:59:58.247Z",
    shipping_cost: 23.57,
    shipping_cost_currency: "USD",
    shipping_method: "Expedited Shipping - (Package for 4 Coffee Mugs) - USD",
    total_tax: 0,
    total_price: 53.57,
    subtotal_price: 30,
    currency: "USD",
    line_items: [
      {
        title: "Medusa Coffee Mug",
        variant_title: "One Size",
        quantity: 3,
        total_price: "10",
        currency: "USD",
        sku: "SKU_935611",
        weight: "500",
        weight_unit: "g",
        manufacture_country: "Canada",
      },
    ],
    weight: 1500,
    weight_unit: "g",
  })
})
