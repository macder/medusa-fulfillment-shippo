import { faker } from "@faker-js/faker"
import {
  makeArrayOf,
  mockCarrierAccountsResponse,
  mockParcelTemplateResponse,
  mockServiceGroup,
  mockLiveRate,
  mockShippoAddress,
  mockTransaction,
  mockExtendedTransaction,
  mockTrack,
} from "./data"

const shippo = jest.fn(() => ({
  carrieraccount: {
    list: jest.fn(async () =>
      mockCarrierAccountsResponse(faker.datatype.number({ min: 8, max: 10 }))
    ),
    retrieve: jest.fn(async (id) => {
      const carriers = {
        carrier_id_123: {
          carrier: "usps",
        },
      }
      return carriers[id]
    }),
  },
  servicegroups: {
    list: jest.fn(async () =>
      makeArrayOf(mockServiceGroup, faker.datatype.number({ min: 2, max: 10 }))
    ),
  },
  userparceltemplates: {
    list: jest.fn(async () =>
      mockParcelTemplateResponse(faker.datatype.number({ min: 8, max: 20 }))
    ),
  },
  liverates: {
    create: jest.fn(async () => {
      const liveRates = { results: makeArrayOf(mockLiveRate, 3) }
      liveRates.results[1].title = "testing 123"
      return liveRates
    }),
  },
  order: {
    create: jest.fn(async () => ({ object_id: "1010101010" })),
    packingslip: jest.fn(async (id) => ({
      expires: "",
      slip_url: "https://console.log",
      created: "",
    })),
    retrieve: jest.fn(async (id) => ({
      object_id: id,
      transactions: [
        {
          object_id: "object_id_5555",
          object_status: "SUCCESS",
        },
      ],
    })),
  },
  account: {
    address: jest.fn(async () => ({
      results: [mockShippoAddress()],
    })),
  },
  transaction: {
    retrieve: jest.fn(async (id) => mockTransaction(id)),
    search: jest.fn(async (q) => {
      const transactions = makeArrayOf(mockExtendedTransaction, 1)
      return {
        results: transactions,
      }
    }),
  },
  track: {
    get_status: jest.fn(async (carrier, num) => {
      const tracks = {
        usps: {
          track_num_1: {
            ...mockTrack(),
            tracking_number: num,
            carrier,
          },
        },
      }

      return tracks[carrier][num]
    }),
  },
}))

export default shippo
