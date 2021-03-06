import { faker } from "@faker-js/faker"

/** Mock Product
 * @return {object} - Mocked Product
 */
export const mockProductOLDOLD = () => ({
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
  hs_code: faker.random.alphaNumeric(10),
  origin_country: faker.address.country(),
  mid_code: faker.random.alphaNumeric(17),
  material: faker.commerce.productMaterial(),
  collection_id: null,
  type_id: null,
  discountable: true,
  external_id: null,
  metadata: null,
})

/** Mock Variant
 * @return {object} - Mocked Variant
 */
export const mockVariantOLD = () => ({
  id: `variant_${faker.database.mongodbObjectId()}`,
  created_at: faker.date.past(),
  updated_at: faker.date.past(),
  deleted_at: null,
  title: faker.random.words(2),
  product_id: `prod_${faker.database.mongodbObjectId()}`,
  sku: faker.random.alphaNumeric(22),
  barcode: faker.random.numeric(12),
  ean: faker.random.numeric(13),
  upc: null,
  inventory_quantity: faker.datatype.number({ min: 100, max: 8000 }),
  allow_backorder: false,
  manage_inventory: true,
  hs_code: faker.random.alphaNumeric(10),
  origin_country: faker.address.country(),
  mid_code: faker.random.alphaNumeric(17),
  material: faker.commerce.productMaterial(),
  weight: faker.datatype.number({ min: 200, max: 3000 }),
  length: faker.datatype.number({ min: 20, max: 100 }),
  width: faker.datatype.number({ min: 20, max: 100 }),
  height: faker.datatype.number({ min: 20, max: 100 }),
  metadata: null,
  product: {},
})
