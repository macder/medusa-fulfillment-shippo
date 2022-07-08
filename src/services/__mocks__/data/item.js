import { faker } from "@faker-js/faker"
import { mockProduct, mockVariant } from "./product"

const mockItemCommon = () => ({
  prod_id: `prod_${faker.database.mongodbObjectId()}`,
  variant_id: `variant_${faker.database.mongodbObjectId()}`,
  prod_title: faker.commerce.productName(),
  variant_title: faker.random.words(2),
  dim: {
    weight: faker.datatype.number({ min: 10, max: 20 }),
    length: faker.datatype.number({ min: 2, max: 10 }),
    width: faker.datatype.number({ min: 2, max: 10 }),
    height: faker.datatype.number({ min: 2, max: 10 }),
  },
})

export const mockItem = () => ({
  id: `item_${faker.database.mongodbObjectId()}`,
  created_at: faker.date.past(),
  updated_at: faker.date.past(),
  cart_id: `cart_${faker.database.mongodbObjectId()}`,
  order_id: `order_${faker.database.mongodbObjectId()}`,
  swap_id: null,
  claim_order_id: null,
  title: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  thumbnail: "",
  is_return: false,
  is_giftcard: false,
  should_merge: true,
  allow_discounts: true,
  has_shipping: true,
  unit_price: faker.datatype.number({ min: 500, max: 1000000 }),
  variant_id: `variant_${faker.database.mongodbObjectId()}`,
  quantity: faker.datatype.number({ min: 1, max: 3 }),
  fulfilled_quantity: null,
  returned_quantity: null,
  shipped_quantity: null,
  metadata: {},
  variant: {},
  tax_lines: [],
  adjustments: [],
})

// WIP
export const mockLineItem = () => {
  const common = mockItemCommon()

  const lineItem = {
    ...mockItem(),
    title: common.prod_title,
    description: common.variant_title,
    variant: {
      ...mockVariant(),
      product_id: common.prod_id,
      title: common.variant_title,
      ...common.dim,
      product: {
        ...mockProduct(),
        id: common.prod_id,
        title: common.prod_title,
        ...common.dim,
      },
    },
  }

  return lineItem
}
