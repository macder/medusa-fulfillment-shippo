import { toBeNumber, toContainKeys } from "jest-extended"

import { makeShippoRatesService } from "./setup"
import { shippoClientMock } from "../__mocks__"
import { cartState } from "../__mocks__/cart"
import { userParcelState } from "../__mocks__/shippo/user-parcel"
import { liveRateState } from "../__mocks__/shippo/live-rate"
import { shippingOptionMock } from "../__mocks__/shipping"

expect.extend({ toBeNumber, toContainKeys })

const mockShippoClient = shippoClientMock({
  live_rate: liveRateState(),
  user_parcels: userParcelState(),
})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("shippoRatesService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  describe("decorateOptions", () => {
    const options = cartState().has.items.shipping_options.map((so) =>
      shippingOptionMock({ ...so })()
    )

    describe("cart has", () => {
      describe("items, address, email", () => {
        // cart has items, no address, no email
        const shippoRatesService = makeShippoRatesService({
          ...cartState().has.items_address_email,
        })

        test("", async () => {
          const results = await shippoRatesService.decorateOptions(
            "cart_id",
            options
          )
          results.forEach((result) => {
            if (result.data.type === "LIVE_RATE") {
              expect(result.amount).toBeNumber()
            }
          })
        })
      })

      describe("items", () => {
        // cart has items, no address, no email
        const shippoRatesService = makeShippoRatesService({
          ...cartState().has.items,
        })

        test("", async () => {
          const results = await shippoRatesService.decorateOptions(
            "cart_id",
            options
          )
          results.forEach((result) => {
            if (result.data.type === "LIVE_RATE") {
              expect(result.amount).toBeNull()
            }
          })
        })
      })

      describe("items, address", () => {
        // cart has items, address, no email
        const shippoRatesService = makeShippoRatesService({
          ...cartState().has.items_address,
        })

        test("", async () => {
          const results = await shippoRatesService.decorateOptions(
            "cart_id",
            options
          )
          results.forEach((result) => {
            if (result.data.type === "LIVE_RATE") {
              expect(result.amount).toBeNull()
            }
          })
        })
      })

      describe("items, email", () => {
        // cart has items, email, no address
        const shippoRatesService = makeShippoRatesService({
          ...cartState().has.items_email,
        })

        test("", async () => {
          const results = await shippoRatesService.decorateOptions(
            "cart_id",
            options
          )
          results.forEach((result) => {
            if (result.data.type === "LIVE_RATE") {
              expect(result.amount).toBeNull()
            }
          })
        })
      })

      describe("address", () => {
        // cart has address, no email, no items
        const shippoRatesService = makeShippoRatesService({
          ...cartState().has.address,
        })

        test("", async () => {
          const results = await shippoRatesService.decorateOptions(
            "cart_id",
            options
          )
          results.forEach((result) => {
            if (result.data.type === "LIVE_RATE") {
              expect(result.amount).toBeNull()
            }
          })
        })
      })

      describe("address email", () => {
        // cart has address, email, no items
        const shippoRatesService = makeShippoRatesService({
          ...cartState().has.address_email,
        })

        test("", async () => {
          const results = await shippoRatesService.decorateOptions(
            "cart_id",
            options
          )
          results.forEach((result) => {
            if (result.data.type === "LIVE_RATE") {
              expect(result.amount).toBeNull()
            }
          })
        })
      })

      describe("email", () => {
        // cart has email, no items, no address
        const shippoRatesService = makeShippoRatesService({
          ...cartState().has.email,
        })

        test("", async () => {
          const results = await shippoRatesService.decorateOptions(
            "cart_id",
            options
          )
          results.forEach((result) => {
            if (result.data.type === "LIVE_RATE") {
              expect(result.amount).toBeNull()
            }
          })
        })
      })

      describe("nothing", () => {
        // cart is new - blank
        const shippoRatesService = makeShippoRatesService({
          ...cartState().has.nothing,
        })

        test("", async () => {
          const results = await shippoRatesService.decorateOptions(
            "cart_id",
            options
          )
          results.forEach((result) => {
            if (result.data.type === "LIVE_RATE") {
              expect(result.amount).toBeNull()
            }
          })
        })
      })
    })

    describe("fetchOptionRate", () => {
      const shippoRatesService = makeShippoRatesService({
        ...cartState().has.items_address_email,
      })

      test("has parcel and shipping option props", async () => {
        const result = await shippoRatesService.fetchOptionRate(
          "cart_default_id",
          options[0].data
        )
        expect(result).toContainKeys(["parcel", "shipping_option"])
      })
    })

    describe("getPrice", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const shippoRatesService = makeShippoRatesService({
        ...cartState().has.items_address_email,
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
})
