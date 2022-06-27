import { faker } from "@faker-js/faker"
import { makeArrayOfMocks, toSnakeCase } from "./data-utils"

const mockServiceLevel = ({ carrier }) => {
  const serviceName = faker.random.words(
    faker.datatype.number({ min: 3, max: 6 })
  )
  const token = toSnakeCase(`${carrier} ${serviceName}`)
  return {
    token: token,
    name: serviceName,
    supports_return_labels: false,
  }
}

/** mockCarrier
 * @return {object} - shippo carrier account object
 */
export const mockCarrier = () => {
  const carrierName = faker.company.companyName()
  return {
    carrier: toSnakeCase(carrierName),
    object_id: faker.database.mongodbObjectId(),
    object_owner: "",
    account_id: `shippo_${toSnakeCase(carrierName)}_account`,
    parameters: {},
    test: faker.datatype.boolean(),
    active: faker.datatype.boolean(),
    is_shippo_account: faker.datatype.boolean(),
    metadata: "",
    carrier_name: carrierName,
    carrier_images: {},
    service_levels: makeArrayOfMocks(
      mockServiceLevel,
      faker.datatype.number({ min: 1, max: 20 }),
      { carrier: carrierName }
    ),
  }
}

/** mockCarrierAccountsResponse
 * @param {int} count - amount of carrier accounts
 * @return {object} - shippo API res:
 * - (/carrier_accounts?service_levels=true&results=[count])
 */
export const mockCarrierAccountsResponse = (count) => {
  return {
    next: null,
    previous: null,
    results: makeArrayOfMocks(mockCarrier, count),
  }
}

/** mockServiceGroups
 * @param {int} count - how many?
 * @return {object}
 */
export const mockServiceGroupLevels = () => {
  return {
    account_object_id: faker.database.mongodbObjectId(),
    service_level_token: "canada_post_expedited_parcel"
  }
}

console.log(
  JSON.stringify(mockServiceGroupLevels(), null, 2)
)

/** mockServiceGroups
 * @param {int} count - how many?
 * @return {object} - shippo API res (/service-groups)
 */
export const mockServiceGroups = () => {
  return {
    description: "2 - 8 days",
    flat_rate: faker.random.numeric(2),
    flat_rate_currency: "CAD",
    free_shipping_threshold_currency: null,
    free_shipping_threshold_min: null,
    is_active: true,
    name: faker.random.words(faker.datatype.number({ min: 2, max: 5 })),
    object_id: faker.database.mongodbObjectId(),
    rate_adjustment: 0,
    service_levels: [],
    type: "LIVE_RATE"
  }
}

console.log(
  JSON.stringify(mockServiceGroups(), null, 2)
)

/** mockParcelTemplate
 * @return {object}
 */
export const mockParcelTemplate = () => ({
  object_id: faker.database.mongodbObjectId(),
  object_owner: faker.internet.email(),
  object_created: faker.date.past(),
  object_updated: faker.date.past(),
  name: faker.random.words(4),
  length: faker.datatype.number({ min: 20, max: 200 }),
  width: faker.datatype.number({ min: 20, max: 200 }),
  height: faker.datatype.number({ min: 20, max: 200 }),
  distance_unit: "cm",
  weight: faker.datatype.number({ min: 200, max: 3000 }),
  weight_unit: "g",
})
