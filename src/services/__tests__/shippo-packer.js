import { faker } from "@faker-js/faker"
import ShippoPackerService from "../shippo-packer"
import ShippoClientService from "../shippo-client"

import {
  makeArrayOf,
  mockLineItem,
  mockParcelTemplate,
} from "../__mocks__/data"

describe("ShippoPackerService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  describe("packBins", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const itemCount = faker.datatype.number({ min: 1, max: 3 })
    const templateCount = faker.datatype.number({ min: 11, max: 22 })

    const parcelTemplates = makeArrayOf(mockParcelTemplate, templateCount)
    const lineItems = makeArrayOf(mockLineItem, itemCount)

    const shippoClientService = new ShippoClientService({}, {})
    const shippoPackerService = new ShippoPackerService(
      { shippoClientService },
      {}
    )

    // WIP
    it("", async () => {
      const result = await shippoPackerService.packBins(
        lineItems,
        parcelTemplates
      )
    })
  })
})
