import { faker } from "@faker-js/faker"
import {
  makeArrayOfMocks,
  mockCarrierAccountsResponse,
  mockParcelTemplateResponse,
  mockServiceGroup,
} from "../__mocks__/data"

const shippo = jest.fn(() => ({
  carrieraccount: {
    list: jest.fn(async () =>
      mockCarrierAccountsResponse(faker.datatype.number({ min: 20, max: 50 }))
    ),
  },
  servicegroups: {
    list: jest.fn(async () =>
      makeArrayOfMocks(
        mockServiceGroup,
        faker.datatype.number({ min: 2, max: 10 })
      )
    ),
  },
  userparceltemplates: {
    list: jest.fn(async () =>
      mockParcelTemplateResponse(faker.datatype.number({ min: 2, max: 20 }))
    ),
  },
  liverates: {
    create: jest.fn(async (e) => e),
  },
}))

export default shippo
