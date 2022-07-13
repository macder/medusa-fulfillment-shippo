import { faker } from "@faker-js/faker"
import {
  makeArrayOf,
  mockCarrierAccountsResponse,
  mockParcelTemplateResponse,
  mockServiceGroup,
  mockLiveRate,
  mockShippoAddress,
} from "../__mocks__/data"

const shippo = jest.fn(() => ({
  carrieraccount: {
    list: jest.fn(async () =>
      mockCarrierAccountsResponse(faker.datatype.number({ min: 8, max: 10 }))
    ),
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
    packingslip: jest.fn(async () => ({
      expires: "",
      slip_url: "https://console.log",
      created: "",
    })),
  },
  account: {
    address: jest.fn(async () => ({
      results: [mockShippoAddress()],
    })),
  },
}))

export default shippo
