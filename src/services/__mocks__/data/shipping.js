import { faker } from "@faker-js/faker"
import { makeArrayOf } from "./data-utils"

import { mockLiveRate, mockServiceGroup } from "./shippo-api"

// **WIP**
export const mockShippingOption = ({ variant = "default" }) => {
  const data = {
    default: {},
    service_group: {
      id: `shippo-fulfillment-${faker.database.mongodbObjectId()}`,
      ...mockServiceGroup(),
    },
  }

  return {
    id: `so_${faker.database.mongodbObjectId()}`,
    name: faker.random.words(3),
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    deleted_at: null,
    region_id: `reg_${faker.database.mongodbObjectId()}`,
    profile_id: `sp_${faker.database.mongodbObjectId()}`,
    provider_id: "shippo",
    price_type: "calculated",
    amount: null,
    is_return: false,
    admin_only: false,

    data: data[variant],

    metadata: null,
    requirements: [],
    profile: {
      id: `sp_${faker.database.mongodbObjectId()}`,
      created_at: faker.date.past(),
      updated_at: faker.date.past(),
      deleted_at: null,
      name: "Default Shipping Profile",
      type: "default",
      metadata: null,
    },
  }
}

export const mockCustomShippingOption = () => {
  return {
    id: `cso_${faker.database.mongodbObjectId()}`,
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    deleted_at: null,
    price: 3121,
    shipping_option_id: `so_${faker.database.mongodbObjectId()}`,
    cart_id: `cart_${faker.database.mongodbObjectId()}`,
    metadata: {
      title: " Priority Shipping Canada",
      amount: "31.21",
      currency: "CAD",
      description: "Next day",
      amount_local: "31.21",
      currency_local: "CAD",
      estimated_days: 1,
      is_shippo_rate: faker.datatype.boolean(),
      parcel_template: faker.database.mongodbObjectId(),
    },
  }
}
