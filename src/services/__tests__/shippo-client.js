import * as matchers from "jest-extended"
import ShippoClientService from "../shippo-client"

expect.extend(matchers)

describe("ShippoClientService", () => {
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
