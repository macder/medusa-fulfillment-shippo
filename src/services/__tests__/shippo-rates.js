import { toBeNumber, toContainKey } from "jest-extended"

import { makeShippoRatesService } from "./setup"
import { shippoClientMock } from "../__mocks__"
import { cartStub } from "../__mocks__/cart"
import { userParcelState } from "../__mocks__/shippo/user-parcel"
import { liveRateState } from "../__mocks__/shippo/live-rate"
import { shippingOptionState, shippingOptionStub } from "../__mocks__/shipping"
import { lineItemState } from "../__mocks__/line-item"
import { addressState } from "../__mocks__/address"

expect.extend({ toBeNumber, toContainKey })

const mockShippoClient = shippoClientMock({
  live_rate: liveRateState,
  user_parcels: userParcelState,
})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("shippoRatesService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const defaultIds = () => ({
    order_id: "order_default",
    display_id: "11",
    cart_id: "cart_default_id",
    claim_order_id: null,
    swap_id: null,
  })

  describe("fetchOptionRate", () => {
    test("has parcel and shipping option props", async () => {
      // arrange
      const state = {
        ...defaultIds(),
        cart_id: "cart_has_address_items_email",
        line_items: [
          lineItemState({ quantity: 1 }),
          lineItemState({ quantity: 2 }),
        ],
        fulfillments: [],
        email: "test@test.com",
        address: addressState("complete"),
      }
      const cart = cartStub({ ...state })
      const shippoRatesService = makeShippoRatesService(state)
      const options = shippingOptionState().map((so) =>
        shippingOptionStub({ ...so })()
      )

      // act
      const result = await shippoRatesService.fetchOptionRate(
        options[0].data,
        cart
      )

      // assert
      expect(result).toContainKey("parcel")
    })
  })

  describe("getPrice", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    // arrange
    const shippoRatesService = makeShippoRatesService({})

    it("returns price from amount * 100", async () => {
      // arrange
      const rate = {
        amount: "93.56",
        amount_local: "",
      }

      // act
      const result = shippoRatesService.getPrice(rate)

      // assert
      expect(result).toBe(9356)
    })

    it("returns price from amount_local * 100", async () => {
      // arrange
      const rate = {
        amount: "93.56",
        amount_local: "41.8",
      }

      // act
      const result = shippoRatesService.getPrice(rate)

      // assert
      expect(result).toBe(4180)
    })
  })
})
