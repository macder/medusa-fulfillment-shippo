import { faker } from "@faker-js/faker"
import { makeArrayOf, toSnakeCase } from "./data-utils"

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
    service_levels: makeArrayOf(
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
    results: makeArrayOf(mockCarrier, count),
  }
}

/** mockServiceGroups
 * @param {int} count - how many?
 * @return {object}
 */
export const mockServiceGroupLevels = () => {
  return {
    account_object_id: faker.database.mongodbObjectId(),
    service_level_token: toSnakeCase(
      faker.random.words(faker.datatype.number({ min: 3, max: 6 }))
    ),
  }
}

/** mockServiceGroups
 * @param {int} count - how many?
 * @return {object} - shippo API res (/service-groups)
 */
export const mockServiceGroup = (type) => {
  return {
    description: faker.random.words(faker.datatype.number({ min: 2, max: 5 })),
    flat_rate: faker.random.numeric(2),
    flat_rate_currency: faker.finance.currencyCode(),
    free_shipping_threshold_currency: null,
    free_shipping_threshold_min: null,
    is_active: true,
    name: faker.random.words(faker.datatype.number({ min: 2, max: 5 })),
    object_id: faker.database.mongodbObjectId(),
    rate_adjustment: 0,
    service_levels: makeArrayOf(
      mockServiceGroupLevels,
      faker.datatype.number({ min: 1, max: 6 })
    ),
    type,
  }
}

// **WIP**
export const mockLiveRate = (isFallback = false) => {
  return {
    title: faker.random.words(faker.datatype.number({ min: 2, max: 5 })), // to match shippingOption.data.name
    description: "2 - 8 days",
    amount: "40",
    currency: "USD",
    amount_local: "20",
    currency_local: "",
    estimated_days: 0,
  }
}

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
  weight: null, // faker.datatype.number({ min: 200, max: 3000 }),
  weight_unit: "g",
})

/** mockParcelTemplateResponse
 * @param {int} count
 * @return {object} - shippo API res:
 * - (/user-parcel-templates)
 */
export const mockParcelTemplateResponse = (count) => {
  return {
    results: makeArrayOf(mockParcelTemplate, count),
  }
}

export const mockTransaction = () => {
  return [
    {
      object_state: "VALID",
      object_status: "SUCCESS",
      object_created: "",
      object_updated: "",
      object_id: "",
      object_owner: "",
      was_test: true,
      rate: "",
      pickup_date: null,
      notification_email_from: false,
      notification_email_to: false,
      notification_email_other: "",
      tracking_number: "",
      address_to: "",
      tracking_status: null,
      tracking_url_provider:
        "https://tools.usps.com/",
      commercial_invoice_url: null,
      messages: [],
      customs_note: "",
      submission_note: "",
      metadata: "",
      is_return: true,
      submission_date: "",
      parcel: "",
      eta: null,
      refund_request_date: null,
      is_user_fraudulent: false,
      legacy_label_file_type: "PDF",
      order: {
        status: "PAID",
        order_number: "207",
        id: 93,
        object_id: "",
      },
    },
  ]
}

export const mockShippoAddress = () => {
  return {
    id: 1111,
    object_created: "",
    object_updated: "",
    name: "",
    company: "",
    street1: "",
    street2: "",
    street_no: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
    email: "",
    is_default_sender: true,
    is_default_return: true,
    store_address_id: null,
    store_platform_names: null
  }
}
