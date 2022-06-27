import { faker } from "@faker-js/faker"
import {
  makeArrayOfMocks,
  mockCarrierAccountsResponse,
  mockServiceGroup,
} from "../__mocks__/data"

const shippo = () => ({
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
  liverates: {
    create: jest.fn(async (e) => e),
  },
})

export default shippo
