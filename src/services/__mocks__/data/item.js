import { faker } from "@faker-js/faker"
import { mockVariantProduct } from "./product"

const lineItem =
  (...[id, getId, quantity]) =>
  (getVariant) =>
    Object.freeze({
      id,
      cart_id: getId("cart"),
      order_id: getId("order"),
      swap_id: getId("swap"),
      claim_order_id: getId("claim"),
      title: getVariant().product.title,
      description: getVariant().title,
      variant_id: getVariant().id,
      unit_price: faker.datatype.number({ min: 500, max: 1000000 }),
      quantity,
      variant: getVariant(),
    })

export const mockLineItem = ({ id, getId, quantity = 1 }) =>
  lineItem(id, getId, quantity)(mockVariantProduct)
