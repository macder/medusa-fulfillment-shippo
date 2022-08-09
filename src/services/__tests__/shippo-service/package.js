import { toBeArray, toContainKey, toContainEntry } from "jest-extended"
import { makeShippoService } from "../setup"
import { lineItemMock } from "../../__mocks__/line-item"
import { shippoClientMock } from "../../__mocks__"
import { cartState } from "../../__mocks__/cart"
import { orderState } from "../../__mocks__/order"
import { userParcelState } from "../../__mocks__/shippo/user-parcel"

expect.extend({ toBeArray, toContainKey, toContainEntry })

const mockShippoClient = shippoClientMock({
  user_parcels: userParcelState(),
})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("shippoService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  describe("package", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoService = makeShippoService(
      orderState({ display_id: "11" }).default
    )

    describe("for", () => {
      describe("local_order", () => {
        it("returns packer output", async () => {
          const result = await shippoService.package
            .for(["local_order", "order_default"])
            .fetch()
          expect(result).toBeArray()
          expect(result[0]).toContainKey("packer_output")
        })
      })

      describe("cart", () => {
        const shippoService = makeShippoService(cartState().has.items)
        it("returns packer output", async () => {
          const result = await shippoService.package
            .for(["cart", "cart_01234567890"])
            .fetch()
          expect(result).toBeArray()
          expect(result[0]).toContainKey("packer_output")
        })
      })

      describe("line_items", () => {
        const lineItems = ["item_123", "item_321"].map((id) =>
          lineItemMock({})({ id: "product_id" })({ id: "variant_id" })(id)
        )

        it("returns packer output", async () => {
          const result = await shippoService.package
            .for(["line_items", lineItems])
            .fetch()
          expect(result).toBeArray()
          expect(result[0]).toContainKey("packer_output")
        })
      })

      describe("fulfillment", () => {
        it("returns packer output", async () => {
          const result = await shippoService.package
            .for(["fulfillment", "ful_default_id_1"])
            .fetch()

          expect(result).toBeArray()
          expect(result[0]).toContainKey("packer_output")
        })
      })
    })

    describe("set", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const packages = userParcelState().map((box) => ({
        ...box,
        name: "box",
      }))

      it("used set boxes", async () => {
        shippoService.package.set("boxes", packages)
        const result = await shippoService.package
          .for(["fulfillment", "ful_default_id_1"])
          .get()
        expect(result[0]).toContainEntry(["name", "box"])
      })
    })
  })
})
