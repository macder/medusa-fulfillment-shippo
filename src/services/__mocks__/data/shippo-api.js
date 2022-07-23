import { faker } from "@faker-js/faker"
import { makeArrayOf, toSnakeCase } from "./data-utils"

const mockServiceLevel = ({ carrier }) => {
  const serviceName = faker.random.words(
    faker.datatype.number({ min: 3, max: 6 })
  )
  const token = toSnakeCase(`${carrier} ${serviceName}`)
  return {
    token,
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
export const mockCarrierAccountsResponse = (count) => ({
  next: null,
  previous: null,
  results: makeArrayOf(mockCarrier, count),
})

/** mockServiceGroups
 * @param {int} count - how many?
 * @return {object}
 */
export const mockServiceGroupLevels = () => ({
  account_object_id: faker.database.mongodbObjectId(),
  service_level_token: toSnakeCase(
    faker.random.words(faker.datatype.number({ min: 3, max: 6 }))
  ),
})

/** mockServiceGroups
 * @param {int} count - how many?
 * @return {object} - shippo API res (/service-groups)
 */
export const mockServiceGroup = (type) => ({
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
})

// **WIP**
export const mockLiveRate = (isFallback = false) => ({
  title: faker.random.words(faker.datatype.number({ min: 2, max: 5 })), // to match shippingOption.data.name
  description: "2 - 8 days",
  amount: "40",
  currency: "USD",
  amount_local: "32.25",
  currency_local: "",
  estimated_days: 0,
})

/** mockParcelTemplate
 * @return {object}
 */
export const mockParcelTemplate = () => ({
  object_id: faker.database.mongodbObjectId(),
  object_owner: faker.internet.email(),
  object_created: faker.date.past(),
  object_updated: faker.date.past(),
  name: faker.random.words(4),
  length: faker.datatype.number({ min: 20000, max: 200000 }),
  width: faker.datatype.number({ min: 20000, max: 200000 }),
  height: faker.datatype.number({ min: 20000, max: 200000 }),
  distance_unit: "cm",
  weight: null, // faker.datatype.number({ min: 200, max: 3000 }),
  weight_unit: "g",
})

/** mockParcelTemplateResponse
 * @param {int} count
 * @return {object} - shippo API res:
 * - (/user-parcel-templates)
 */
export const mockParcelTemplateResponse = (count) => ({
  results: makeArrayOf(mockParcelTemplate, count),
})

export const mockExtendedTransaction = (id = null) => {
  const transaction = {
    123: {
      object_state: "VALID",
      object_status: "SUCCESS",
      object_id: "object_id_transaction_123",
      rate: {
        carrier_account: "carrier_id_123",
      },
      tracking_number: "track_num_1",
      address_to: "",
      tracking_status: null,
      tracking_url_provider: "https://tools.usps.com/",
      commercial_invoice_url: null,
      messages: [],
      metadata: "Order 123",
      is_return: false,
      order: {
        status: "PAID",
        order_number: "123",
        id: 93,
        object_id: "",
      },
    },
    321: {
      object_state: "VALID",
      object_status: "SUCCESS",
      object_id: "object_id_return",
      rate: {
        carrier_account: "carrier_id_123",
      },
      tracking_number: "track_num_1",
      address_to: "",
      tracking_status: null,
      tracking_url_provider: "https://tools.usps.com/",
      commercial_invoice_url: null,
      messages: [],
      metadata: "Order 123",
      is_return: true,
      order: {
        status: "PAID",
        order_number: "123",
        id: 93,
        object_id: "",
      },
    },
  }
  return transaction[id]
}

export const mockTransaction = (id) => {
  const transaction = {
    object_id_transaction_123: {
      object_state: "VALID",
      status: "SUCCESS",
      object_created: "",
      object_updated: "",
      object_id: "object_id_transaction_123",
      object_owner: "",
      test: true,
      rate: "",
      tracking_number: "1ab2c3",
      tracking_status: "UNKNOWN",
      eta: null,
      tracking_url_provider: "https://tools.usps.com",
      commercial_invoice_url: null,
      messages: [],
      order: "object_id_order_123",
      metadata: "Order 123",
      parcel: "",
      billing: {
        payments: [],
      },
    },
    object_id_return: {
      object_state: "VALID",
      status: "SUCCESS",
      object_created: "",
      object_updated: "",
      object_id: "object_id_return",
      object_owner: "",
      test: true,
      rate: "",
      tracking_number: "1ab2c3",
      tracking_status: "UNKNOWN",
      eta: null,
      tracking_url_provider: "https://tools.usps.com",
      commercial_invoice_url: null,
      messages: [],
      order: "object_id_order_123",
      metadata: "Order 321",
      parcel: "",
      billing: {
        payments: [],
      },
    },
    object_id_transaction_replace_123: {
      object_state: "VALID",
      status: "SUCCESS",
      object_created: "",
      object_updated: "",
      object_id: "object_id_transaction_replace_123",
      object_owner: "",
      test: true,
      rate: "",
      tracking_number: "1ab2c3",
      tracking_status: "UNKNOWN",
      eta: null,
      tracking_url_provider: "https://tools.usps.com",
      commercial_invoice_url: null,
      messages: [],
      order: "object_id_order_replace_123",
      metadata: "Order 123",
      parcel: "",
      billing: {
        payments: [],
      },
    },
    object_id_transaction_swap_123: {
      object_state: "VALID",
      status: "SUCCESS",
      object_created: "",
      object_updated: "",
      object_id: "object_id_order_swap_123",
      object_owner: "",
      test: true,
      rate: "",
      tracking_number: "1ab2c3",
      tracking_status: "UNKNOWN",
      eta: null,
      tracking_url_provider: "https://tools.usps.com",
      commercial_invoice_url: null,
      messages: [],
      order: "object_id_order_swap_123",
      metadata: "Order 123",
      parcel: "",
      billing: {
        payments: [],
      },
    },
  }

  return transaction[id]
}

export const mockShippoAddress = () => ({
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
  store_platform_names: null,
})

export const mockTrack = () => ({
  tracking_number: "SHIPPO_DELIVERED",
  carrier: "shippo",
  servicelevel: {
    name: "Priority Mail",
    token: "shippo_priority",
  },
  transaction: null,
  address_from: {
    city: "San Francisco",
    state: "CA",
    zip: "94103",
    country: "US",
  },
  address_to: {
    city: "Chicago",
    state: "IL",
    zip: "60611",
    country: "US",
  },
  eta: "2022-07-22T05:12:23.687Z",
  original_eta: "2022-07-22T05:12:23.687Z",
  metadata: "Shippo test tracking",
  test: true,
  tracking_status: {
    status_date: "2022-07-20T22:23:44.429Z",
    status_details: "Your shipment has been delivered.",
    location: {
      city: "Chicago",
      state: "IL",
      zip: "60611",
      country: "US",
    },
    substatus: null,
    object_created: "2022-07-20T22:23:44.429Z",
    object_updated: "2022-07-20T22:23:44.429Z",
    object_id: "d23adeebb8de41629097d867f5fdfdec",
    status: "DELIVERED",
  },
  tracking_history: [
    {
      status_date: "2022-07-18T18:23:44.429Z",
      status_details:
        "The carrier has received the electronic shipment information.",
      location: null,
      substatus: null,
      object_created: "2022-07-18T18:23:44.429Z",
      object_updated: "2022-07-18T18:23:44.429Z",
      object_id: "4d8cc3019d7b4f1ea27a6f28ce09c393",
      status: "UNKNOWN",
    },
    {
      status_date: "2022-07-19T22:23:44.429Z",
      status_details: "Your shipment has departed from the origin.",
      location: {
        city: "San Francisco",
        state: "CA",
        zip: "94103",
        country: "US",
      },
      substatus: null,
      object_created: "2022-07-19T22:23:44.429Z",
      object_updated: "2022-07-19T22:23:44.429Z",
      object_id: "fb322d1519cf4482abca05a5f183f359",
      status: "TRANSIT",
    },
    {
      status_date: "2022-07-21T10:23:44.429Z",
      status_details:
        "The Postal Service has identified a problem with the processing of this item and you should contact support to get further information.",
      location: {
        city: "Memphis",
        state: "TN",
        zip: "37501",
        country: "US",
      },
      substatus: null,
      object_created: "2022-07-21T10:23:44.429Z",
      object_updated: "2022-07-21T10:23:44.429Z",
      object_id: "e6f4ca1f655f44e9b35c54a0b6259e8d",
      status: "FAILURE",
    },
    {
      status_date: "2022-07-20T22:23:44.429Z",
      status_details: "Your shipment has been delivered.",
      location: {
        city: "Chicago",
        state: "IL",
        zip: "60611",
        country: "US",
      },
      substatus: null,
      object_created: "2022-07-20T22:23:44.429Z",
      object_updated: "2022-07-20T22:23:44.429Z",
      object_id: "d23adeebb8de41629097d867f5fdfdec",
      status: "DELIVERED",
    },
  ],
  messages: [],
})
