import { faker } from "@faker-js/faker"
import { mockAddress } from "./customer"
import { mockLineItem } from "./item"
import { mockRegion } from "./region"
import { makeArrayOfMocks } from "./data-utils"

// **WIP**

/** Mock Cart
 * @param {object} state
 * @param {?int} [state.hasItems] - number of items in cart
 * @param {bool} [state.hasAddress=true] - has complete address?
 * @return {object} - Mocked Cart
 */
export const mockCart = ({ hasAddress = true, hasItems }) => {
  const shippingAddress = mockAddress(hasAddress)
  const lineItems = hasItems ? makeArrayOfMocks(mockLineItem, hasItems) : []
  const region = mockRegion({ countries: 3 })

  const common = {
    addr_id: {
      shipping: shippingAddress.id,
      billing: `addr_${faker.database.mongodbObjectId()}`,
    },
    reg_id: region.id,
    cus_id: `cus_${faker.database.mongodbObjectId()}`,
  }

  return {
    object: "cart",
    id: `cart_${faker.database.mongodbObjectId()}`,
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    deleted_at: null,
    email: hasAddress ? faker.internet.email() : null,
    customer_id: null,
    payment_id: null,
    type: "default",
    completed_at: null,
    payment_authorized_at: null,
    idempotency_key: null,
    metadata: null,
    subtotal: 0,
    tax_total: 0,
    shipping_total: 0,
    discount_total: 0,
    gift_card_total: 0,
    total: 0,
    context: {},
    gift_cards: [],
    region: region,
    items: lineItems,
    billing_address_id: null,
    shipping_address_id: common.addr_id.shipping,
    region_id: common.reg_id,
    payment: null,
    shipping_address: shippingAddress,
    billing_address: null,
    shipping_methods: [],
    payment_sessions: [],
    discounts: [],
  }
}

// console.log(
//   JSON.stringify(mockCart({ hasAddress: false, hasItems: 1 }), null, 2)
// )
