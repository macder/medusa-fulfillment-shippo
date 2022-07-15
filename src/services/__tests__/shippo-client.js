import * as matchers from "jest-extended"
import ShippoClientService from "../shippo-client"
import shippo from "shippo"

expect.extend(matchers)

describe("ShippoClientService", () => {
  const fulfillmentService = {
    retrieve: jest.fn(async (id) => ({
      id: "ful_id_123",
      data: {
        shippo_order_id: "order_id_123",
      },
    })),
  }

  describe("fetchOrder", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService(
      { fulfillmentService },
      {}
    )

    it("fetches shippo order with correct id", async () => {
      const result = await shippoClientService.fetchOrder("ful_id_123")
      expect(result).toBeObject()
      expect(result).toContainEntry(["object_id", "order_id_123"])
    })
  })

  describe("fetchPackingSlip", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService(
      { fulfillmentService },
      {}
    )

    it("fetches packing slip", async () => {
      const result = await shippoClientService.fetchPackingSlip("ful_id_123")
      expect(result).toBeObject()
    })
  })

  describe("fetchUserParcelTemplates", () => {
    const shippoClientService = new ShippoClientService({}, {})

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("flatens user-parcel-templates reponse to response.results", async () => {
      const result = await shippoClientService.fetchUserParcelTemplates()

      expect(Array.isArray(result)).toBe(true)

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            object_id: expect.any(String),
          }),
        ])
      )
    })
  })
})
