import { toBeNumber, toContainKey } from "jest-extended"

import { makeShippoRatesService } from "./setup"
import { shippoClientMock } from "../__mocks__"
import { cartMock, cartState } from "../__mocks__/cart"
import { userParcelState } from "../__mocks__/shippo/user-parcel"
import { liveRateState } from "../__mocks__/shippo/live-rate"
import { shippingOptionStub } from "../__mocks__/shipping"

expect.extend({ toBeNumber, toContainKey })

const mockShippoClient = shippoClientMock({
  live_rate: liveRateState(),
  user_parcels: userParcelState(),
})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("shippoRatesService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const shippoRatesService = makeShippoRatesService({
    ...cartState().has.items_address_email,
  })

  describe("fetchOptionRate", () => {
    const options = cartState().has.items.shipping_options.map((so) =>
      shippingOptionStub({ ...so })()
    )

    const cart = cartMock(cartState().has.items_address_email)(
      "cart_default_id"
    )

    test("has parcel and shipping option props", async () => {
      const result = await shippoRatesService.fetchOptionRate(
        options[0].data,
        cart
      )
      expect(result).toContainKey("parcel")
    })
  })

  describe("getPrice", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns price from amount * 100", async () => {
      const rate = {
        amount: "93.56",
        amount_local: "",
      }
      const result = shippoRatesService.getPrice(rate)
      expect(result).toBe(9356)
    })

    it("returns price from amount_local * 100", async () => {
      const rate = {
        amount: "93.56",
        amount_local: "41.8",
      }
      const result = shippoRatesService.getPrice(rate)
      expect(result).toBe(4180)
    })
  })
})
