import { toContainEntry } from "jest-extended"
import { makeShippoService } from "../setup"
import { shippoClientMock } from "../../__mocks__"

expect.extend({ toContainEntry })

const mockShippoClient = shippoClientMock({})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("shippoService", () => {
  const shippoService = makeShippoService({})

  describe("account", () => {
    it("returns default address", async () => {
      const result = await shippoService.account.address()
      expect(result).toContainEntry(["is_default_sender", true])
    })
  })
})
