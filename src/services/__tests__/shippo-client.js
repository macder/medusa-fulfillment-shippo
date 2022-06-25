import { MockRepository, MockManager, IdMap } from "medusa-test-utils"
import ShippoClientService from "../shippo-client"
import data from "../__mocks__/shippo-data.json"

describe("ShippoFulfillmentService", () => {
  describe("findActiveCarriers", () => {
    const shippoClientService = new ShippoClientService(
      {}, {}
    )

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns only active carriers accounts", async () => {
      const findActiveCarriers = await shippoClientService
        .findActiveCarriers_([...data.carrier_accounts])

      findActiveCarriers.forEach(
        item => expect(item.active).toBe(true)
      )
    })
  })

  describe("splitCarriersToServices_", () => {
    const shippoClientService = new ShippoClientService(
      {}, {}
    )

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("splits carrier objects into service levels", async () => {
      
      const carriers = data.carrier_accounts.filter(item => item.active === true)
      
      const serviceOptions = await shippoClientService
        .splitCarriersToServices_(carriers)
        
      expect(serviceOptions).toStrictEqual(data.service_level_option)
    })
  })

})
