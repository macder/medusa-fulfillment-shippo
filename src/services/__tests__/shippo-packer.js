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

    // const shippoClientService = new ShippoClientService({}, {})
    // const shippoPackerService = new ShippoPackerService(
    //   { shippoClientService },
    //   {}
    // )

    // shippoPackerService.parcelTemplates = mockUserParcels()

    it("", async () => {
      // const result = await shippoPackerService.packBins(
      //   lineItems
      // )

      // console.log(result.name, result.packer_output.volume)

      // result.forEach(e => {
      //   console.log(e.name, e.packer_output.volume)
      // })

      // console.log('*********result: ', JSON.stringify(result, null, 2))
    })
  })
})
