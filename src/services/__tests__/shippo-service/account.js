import * as matchers from "jest-extended"
import { makeShippoService } from "../setup"
import { orderState } from "../../__mocks__/order"
import { shippoClientMock } from "../../__mocks__"

expect.extend(matchers)

const mockShippoClient = shippoClientMock({})

jest.mock("shippo", () => () => mockShippoClient)

describe("shippoService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })
  const shippoService = makeShippoService({})

  describe("account", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns default address", async () => {
      const result = await shippoService.account.address()
      expect(result).toContainEntry(["is_default_sender", true])
    })
  })
})
