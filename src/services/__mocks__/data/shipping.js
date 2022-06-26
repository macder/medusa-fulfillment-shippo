import { faker } from "@faker-js/faker"

export const mockShippingOption = () => {

  return {
    id: `so_${faker.database.mongodbObjectId()}`,
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    deleted_at: null,
    name: "Expedited Shipping",
    region_id: `reg_${faker.database.mongodbObjectId()}`,
    profile_id: `sp_${faker.database.mongodbObjectId()}`,
    provider_id: "shippo",
    price_type: "calculated",
    amount: null,
    is_return: false,
    admin_only: false,
    data: {
      id: "shippo-fulfillment-1010101010101010",
      name: "Expedited Shipping Canada",
      type: "LIVE_RATE",
      is_group: true,
      flat_rate: "15",
      is_active: true,
      object_id: "1010101010101010",
      description: "2 - 8 days",
      service_levels: [
        {
          account_object_id: "0101010101010101010101101010",
          service_level_token: "canada_post_expedited_parcel"
        }
      ],
      rate_adjustment: 0,
      flat_rate_currency: "CAD",
      free_shipping_threshold_min: null,
      free_shipping_threshold_currency: null
    },
    metadata: null
  }

}


