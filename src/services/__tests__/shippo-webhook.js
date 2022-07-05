import * as matchers from "jest-extended"
import ShippoWebhookService from "../shippo-webhook"

expect.extend(matchers)

describe("ShippoWebhookService", () => {
  describe("verifyHookSecret", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns true when token equals webhook_secret", async () => {
      const shippoWebhookService = new ShippoWebhookService(
        {},
        { webhook_secret: "secret" }
      )
      const result = await shippoWebhookService.verifyHookSecret("secret")
      expect(result).toBeTrue()
    })

    it("returns false when token not equal webhook_secret", async () => {
      const shippoWebhookService = new ShippoWebhookService(
        {},
        { webhook_secret: "secret" }
      )
      const result = await shippoWebhookService.verifyHookSecret("different")
      expect(result).toBeFalse()
    })

    it("returns false when token is string and webhook_secret undefined", async () => {
      const shippoWebhookService = new ShippoWebhookService({}, {})
      const result = await shippoWebhookService.verifyHookSecret("secret")
      expect(result).toBeFalse()
    })

    it("returns false when token null and webhook_secret undefined", async () => {
      const shippoWebhookService = new ShippoWebhookService({}, {})
      const result = await shippoWebhookService.verifyHookSecret(null)
      expect(result).toBeFalse()
    })

    it("returns false when token true and webhook_secret undefined", async () => {
      const shippoWebhookService = new ShippoWebhookService({}, {})
      const result = await shippoWebhookService.verifyHookSecret(true)
      expect(result).toBeFalse()
    })

    it("returns false when token true and webhook_secret defined", async () => {
      const shippoWebhookService = new ShippoWebhookService(
        {},
        { webhook_secret: "secret" }
      )
      const result = await shippoWebhookService.verifyHookSecret(true)
      expect(result).toBeFalse()
    })

    it("returns false when token undefined and webhook_secret undefined", async () => {
      const shippoWebhookService = new ShippoWebhookService({}, {})
      const result = await shippoWebhookService.verifyHookSecret()
      expect(result).toBeFalse()
    })

    it("returns false when token empty string and webhook_secret empty string", async () => {
      const shippoWebhookService = new ShippoWebhookService(
        {},
        { webhook_secret: "" }
      )

      const result = await shippoWebhookService.verifyHookSecret("")
      expect(result).toBeFalse()
    })
  })
})
