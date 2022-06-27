import ShippoClientService from "../shippo-client"

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

  describe("fetchCustomParcelTemplates", () => {
    const shippoClientService = new ShippoClientService({}, {})

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("flatens user-parcel-templates reponse to response.results", async () => {
      const result = await shippoClientService.fetchCustomParcelTemplates()

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
