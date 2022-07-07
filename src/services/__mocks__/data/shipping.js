import { faker } from "@faker-js/faker"
import { makeArrayOf } from "./data-utils"

import { mockLiveRate, mockServiceGroup } from "./shippo-api"
import { mockShippoBinPack } from "./packer"

// **WIP**
export const mockShippingOption = ({ variant = "default" }) => {
  const id = `shippo-fulfillment-${faker.database.mongodbObjectId()}`

  const data = {
    default: {},
    live_rate: {
      id,
      ...mockServiceGroup("LIVE_RATE"),
    },
    flat_rate: {
      id,
      ...mockServiceGroup("FLAT_RATE"),
    },
    free: {
      id,
      ...mockServiceGroup("FREE_SHIPPING"),
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

export const mockFulfillmentOption = ({ type }) => {
  return {
    id: `shippo-fulfillment-${faker.database.mongodbObjectId()}`,
    name: faker.random.words(3),
    type: type,
    is_group: true,
    flat_rate: "10",
    is_active: true,
    object_id: "7ef2bce4ba344f448bde8425673d936a",
    description: "",
    service_levels: [
      {
        account_object_id: "ccb65e8b70b84e218ce26e9bbe90bdad",
        service_level_token: "usps_priority",
      },
    ],
    rate_adjustment: 0,
    flat_rate_currency: "USD",
    free_shipping_threshold_min: null,
    free_shipping_threshold_currency: null,
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
      ...mockLiveRate(),
      is_shippo_rate: true,
      parcel_template: faker.database.mongodbObjectId(),

      shippo_binpack: makeArrayOf(mockShippoBinPack, 2),
    },
  }
}
