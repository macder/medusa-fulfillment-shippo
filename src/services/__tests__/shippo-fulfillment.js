import ShippoClientService from "../shippo-client"
import ShippoFulfillmentService from "../shippo-fulfillment"

describe("ShippoFulfillmentService", () => {
  describe("getFulfillmentOptions", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService(
      { shippoClientService },
      {}
    )

    it("returned fulfillment options as expected", async () => {
      const result = await shippoFulfilService.getFulfillmentOptions()

      expect(Array.isArray(result)).toBe(true)

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        ])
      )
    })
  })

  describe("validateOption", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService(
      { shippoClientService },
      {}
    )

    it("returned true", async () => {
      const result = await shippoFulfilService.validateOption({ test: "test" })
      expect(result).toEqual(true)
    })
  })

  describe("validateFulfillmentData", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService(
      { shippoClientService },
      {}
    )

    it("returned data object from param", async () => {
      const result = await shippoFulfilService.validateFulfillmentData(
        { test: "test" },
        { test: "test" },
        { test: "test" }
      )
      expect(result).toEqual({ test: "test" })
    })
  })

  describe("cancelFulfillment", () => {
    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService({
      shippoClientService,
    })

    it("returns resolved promise", async () => {
      expect.assertions(1)
      await expect(shippoFulfilService.cancelFulfillment()).resolves.toEqual({})
    })
  })

  describe("canCalculate", () => {
    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService({
      shippoClientService,
    })
    it("returns true when live-rate", async () => {
      expect(shippoFulfilService.canCalculate({ type: "LIVE_RATE" })).toBe(true)
    })
    it("returns false when free", async () => {
      expect(shippoFulfilService.canCalculate({ type: "FREE" })).toBe(false)
    })
    it("returns false when flat rate", async () => {
      expect(shippoFulfilService.canCalculate({ type: "FLAT" })).toBe(false)
    })
    it("returns false when type missing", async () => {
      expect(shippoFulfilService.canCalculate({})).toBe(false)
    })
  })

  describe("formatLineItems_", () => {
    // const totalsService = {
    //   getLineItemTotals: jest.fn(async () => data.line_item_totals),
    // }
    // const shippoFulfilService = new ShippoFulfillmentService({
    //   totalsService,
    //   shippoClientService,
    // })
    // it("returns correct data format for shippo line item", async () => {
    //   expect(
    //     await shippoFulfilService.formatLineItems_(
    //       data.fulfillmentItems,
    //       data.fromOrder
    //     )
    //   ).toStrictEqual(data.shippo_line_items)
    // })
  })
})
