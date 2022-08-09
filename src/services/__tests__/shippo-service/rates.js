import { toBeArray, toContainKey } from "jest-extended"
import { makeShippoService } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { cartState } from "../../__mocks__/cart"
import { userParcelState } from "../../__mocks__/shippo/user-parcel"
import { liveRateState } from "../../__mocks__/shippo/live-rate"

expect.extend({ toBeArray, toContainKey })

const mockShippoClient = shippoClientMock({
  live_rate: liveRateState(),
  user_parcels: userParcelState(),
})

jest.mock("shippo", () => () => mockShippoClient)

describe("rates", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })
  describe("for", () => {
    describe("cart", () => {
      describe("fetch", () => {
        const shippoService = makeShippoService({
          ...cartState().has.items_address_email,
        })
        test("returns rate with parcel id", async () => {
          const id = "cart_default_id"
          const result = await shippoService.rates.for(["cart", id]).fetch()
          expect(result).toBeArray()
          expect(result[0]).toContainKey("parcel")
        })
      })
    })
  })
})
