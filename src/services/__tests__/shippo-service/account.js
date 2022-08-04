import * as matchers from "jest-extended"
import { buildShippoServices } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { defaults as defaultProps } from "../../__mocks__/props"

expect.extend(matchers)

const mockShippoClient = shippoClientMock(defaultProps)

jest.mock("shippo", () => () => mockShippoClient)

describe("shippoService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  describe("account", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })
    const { shippoService } = buildShippoServices(defaultProps)

    it("returns default address", async () => {
      const result = await shippoService.account.address()
      expect(result).toContainEntry(["is_default_sender", true])
    })
  })
})
