import { faker } from "@faker-js/faker"

export const lineItemState = ({ quantity = 1 }) => ({
  id: `item_${faker.database.mongodbObjectId()}`,
  product_id: `prod_${faker.database.mongodbObjectId()}`,
  variant_id: `variant_${faker.database.mongodbObjectId()}`,
  quantity,
})
