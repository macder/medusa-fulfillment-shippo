import { faker } from "@faker-js/faker"
import {
  makeArrayOf,
  mockCarrierAccountsResponse,
  mockParcelTemplateResponse,
  mockServiceGroup,
  mockLiveRate,
} from "../__mocks__/data"

const shippo = jest.fn(() => ({
  carrieraccount: {
    list: jest.fn(async () =>
      mockCarrierAccountsResponse(faker.datatype.number({ min: 20, max: 50 }))
    ),
  },
  servicegroups: {
    list: jest.fn(async () =>
      makeArrayOf(mockServiceGroup, faker.datatype.number({ min: 2, max: 10 }))
    ),
  },
  userparceltemplates: {
    list: jest.fn(async () =>
      mockParcelTemplateResponse(faker.datatype.number({ min: 2, max: 20 }))
    ),
  },
  liverates: {
    create: jest.fn(async () => ({ results: makeArrayOf(mockLiveRate, 10) })),
  },
}))

export default shippo
