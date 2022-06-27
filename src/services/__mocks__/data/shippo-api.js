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
 * @param {int} - amount of carrier accounts
 * @return {object} - mock response (/carrier_accounts?service_levels=true&results=[count])
 */
export const mockCarrierAccountsResponse = (count) => {
  return {
    next: "",
    previous: null,
    results: makeArrayOfMocks(mockCarrier, count),
  }
}

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
