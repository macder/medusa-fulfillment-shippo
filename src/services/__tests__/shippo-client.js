import * as matchers from "jest-extended"
import ShippoClientService from "../shippo-client"

expect.extend(matchers)

describe("ShippoClientService", () => {
  describe("fetchCarriers_", () => {
    const shippoClientService = new ShippoClientService({}, {})

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("flattens response down to response.results", async () => {
      const result = await shippoClientService.fetchCarriers_()

      expect(Array.isArray(result)).toBe(true)

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            carrier: expect.any(String),
            carrier_name: expect.any(String),
          }),
        ])
      )
    })
  })

  describe("findActiveCarriers", () => {
    const shippoClientService = new ShippoClientService({}, {})

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns only active carriers accounts", async () => {
      const result = await shippoClientService
        .fetchCarriers_()
        .then(
          async (response) =>
            await shippoClientService.findActiveCarriers_(response)
        )

      result.forEach((item) => expect(item.active).toBe(true))
    })
  })

  describe("splitCarriersToServices_", () => {
    const shippoClientService = new ShippoClientService({}, {})

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("splits carrier objects into service levels", async () => {
      const carriers = await shippoClientService
        .fetchCarriers_()
        .then(
          async (carriers) =>
            await shippoClientService.findActiveCarriers_(carriers)
        )

      const expectedLength = carriers.flatMap(
        (item) => item.service_levels
      ).length
      const result = await shippoClientService.splitCarriersToServices_(
        carriers
      )

      expect(result.length).toBe(expectedLength)

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            active: true,
            name: expect.any(String),
            id: expect.any(String),
          }),
        ])
      )
    })
  })

  describe("fetchServiceGroups_", () => {
    const shippoClientService = new ShippoClientService({}, {})

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns correctly structured service groups", async () => {
      const result = await shippoClientService.fetchServiceGroups_()

      expect(Array.isArray(result)).toBe(true)

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            is_group: true,
            name: expect.any(String),
          }),
        ])
      )
    })
  })

  describe("composeFulfillmentOptions_", () => {
    const shippoClientService = new ShippoClientService({}, {})

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns correctly structured fulfillment options", async () => {
      const result = await shippoClientService.composeFulfillmentOptions_()

      expect(Array.isArray(result)).toBe(true)

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            id: expect.any(String),
          }),
        ])
      )
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

  describe("getClient", () => {
    const shippoClientService = new ShippoClientService({}, {})

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("return shippo client", async () => {
      const result = shippoClientService.getClient()

      expect(result).toEqual(
        expect.objectContaining({
          carrieraccount: expect.any(Object),
          servicegroups: expect.any(Object),
          userparceltemplates: expect.any(Object),
          liverates: expect.any(Object),
          // TODO: add all of them when mocked
        })
      )
    })
  })

  describe("setConfig_", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("sets config as pluging", async () => {
      const shippoClientService = new ShippoClientService(
        {},
        {
          api_key: "secret",
          weight_unit_type: "g",
          dimension_unit_type: "cm",
        }
      )

      expect(shippoClientService.options_).toEqual(
        expect.objectContaining({
          api_key: expect.any(String),
          weight_unit_type: expect.any(String),
          dimension_unit_type: expect.any(String),
        })
      )
    })

    it("sets config as standalone", async () => {
      const shippoClientService = new ShippoClientService({}, {})

      expect(shippoClientService.options_).toEqual(
        expect.objectContaining({
          api_key: expect.any(String),
          weight_unit_type: expect.any(String),
          dimension_unit_type: expect.any(String),
        })
      )
    })
  })
})
