import { productLineItem, shippoAddress, shippoLineItem } from "../formatters"

const lineItem = {
  title: "Line Item Title",
  description: "One Size",
  unit_price: 1000,
  quantity: 6,
  variant: {
    id: "2222",
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
      id: "1111",
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

test("Formatter: productLineItem", () => {})

test("Formatter: productLineItem", () => {
  expect(productLineItem(lineItem, "test@test.com")).toStrictEqual({
    product_id: "1111",
    variant_id: "2222",
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
