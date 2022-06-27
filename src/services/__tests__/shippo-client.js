import ShippoClientService from "../shippo-client"
import data from "../__mocks__/data/temp/shippo-data.json"

describe("ShippoFulfillmentService", () => {
  describe("findActiveCarriers", () => {
    const shippoClientService = new ShippoClientService({}, {})

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns only active carriers accounts", async () => {
      const findActiveCarriers = await shippoClientService.findActiveCarriers_([
        ...data.carrier_accounts,
      ])

      findActiveCarriers.forEach((item) => expect(item.active).toBe(true))
    })
  })

  describe("splitCarriersToServices_", () => {
    const shippoClientService = new ShippoClientService({}, {})

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("splits carrier objects into service levels", async () => {
      const carriers = data.carrier_accounts.filter(
        (item) => item.active === true
      )

      expect(
        await shippoClientService.splitCarriersToServices_(carriers)
      ).toStrictEqual(data.service_level_option)
    })
  })

  describe("composeFulfillmentOptions_", () => {
    const shippoClientService = new ShippoClientService({}, {})

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns correctly structured fulfillment options", async () => {
      expect(
        await shippoClientService.composeFulfillmentOptions_()
      ).toStrictEqual(data.fulfillment_options)
    })
  })
})

// console.log(
//   `      \x1b[36m======================================================================================================
//       \x1b[93m \x1b[40m ShippoFulfillmentService -> createFulfillment() -> parcel'\x1b[0m
//       \x1b[33m ${JSON.stringify(fulfillmentOptions, null, 2)}
//       \x1b[36m======================================================================================================END`,
//   '\x1b[0m')
