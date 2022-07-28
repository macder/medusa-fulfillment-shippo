import { faker } from "@faker-js/faker"
import { mockVariantProduct } from "./product"

const lineItem =
  ({
    id,
    order_id = null,
    claim_order_id = null,
    swap_id = null,
    cart_id = null,
    title,
    variant_title: description,
  }) =>
  ({ variant_id = null, variant = null }) => {
    const lineItem = {
      id,
      cart_id,
      order_id,
      swap_id,
      claim_order_id,
      title,
      description,
      variant_id,
      unit_price: faker.datatype.number({ min: 500, max: 1000000 }),
      quantity: faker.datatype.number({ min: 1, max: 3 }),
      variant,
    }

    return lineItem
  }

// const params = {
//   id: "item_01234567890",
//   order_id: "order_01234567890",
//   title: "Medusa Sweatshirt",
//   variant_id: "variant_01234567890",
//   product_id: "prod_01234567890",
//   variant_title: "Small",
//   description: "Reimagine the feeling of a classic sweatshirt.",
// }

/**
 * Compose a {LineItem} mock
 * @param {Object} obj
 * @param {string} obj.id - line item id
 * @param {string} [obj.order_id] - order id
 * @param {string} [obj.cart_id] - cart id
 * @param {string} [obj.claim_order_id ] - claim order id
 * @param {string} [obj.swap_id] - swap id
 * @param {string} obj.title - product title
 * @param {string} obj.variant_id - variant id
 * @param {string} obj.product_id - product id
 * @param {string} obj.variant_title - variant title
 * @param {string} obj.description - product description
 */
export const mockLineItem = ({ ...params }) =>
  lineItem({ ...params })({
    ...params,
    variant: mockVariantProduct({ ...params }),
  })

export const fnLineItemMock =
  () =>
  ({ ...params }) =>
    lineItem({ ...params })({
      ...params,
      variant: mockVariantProduct({ ...params }),
    })
