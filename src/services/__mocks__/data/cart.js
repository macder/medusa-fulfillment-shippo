import { faker } from "@faker-js/faker"
import { mockAddress } from "./customer"
import { mockLineItem } from "./item"
import { makeArrayOfMocks } from "./data-utils.js"


export const mockCart = () => {

  const common = {

  }

  return {
    object: "cart",
    id: `cart_${faker.database.mongodbObjectId()}`,
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    deleted_at: null,
    
    email: null,

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
    region: {},
    items: [],

    billing_address_id: null,
    shipping_address_id: "addr_01G6GM82WJWWTJCDKCJQKG3K4B",
    region_id: "reg_01G4XYVBF3SDMZ5MVKBJBN8FTC",

    payment: null,
    shipping_address: mockAddress(),
    billing_address: null,

    shipping_methods: [],
    payment_sessions: [],
    discounts: [],

  }

}

console.log(
  JSON.stringify(mockCart(), null, 2)
)