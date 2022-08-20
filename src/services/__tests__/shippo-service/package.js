import { toBeArray, toContainKey, toContainEntry } from "jest-extended"
import { makeShippoHelper, makeShippoService } from "../setup"
import { lineItemState, lineItemStub } from "../../__mocks__/line-item"
import { shippoClientMock } from "../../__mocks__"
import { addressState } from "../../__mocks__/address"
import { userParcelState } from "../../__mocks__/shippo/user-parcel"
import { fulfillmentState } from "../../__mocks__/fulfillment"

expect.extend({ toBeArray, toContainKey, toContainEntry })

const mockShippoClient = shippoClientMock({
  user_parcels: userParcelState,
})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("shippoService", () => {
  describe("package", () => {
    const defaultIds = () => ({
      order_id: "order_default",
      display_id: "11",
      cart_id: "cart_default_id",
      claim_order_id: null,
      swap_id: null,
    })

    let shippoService

    describe("for", () => {
      describe("local_order", () => {
        beforeEach(() => {
          const state = {
            ...defaultIds(),
            order_id: "local_order_has_line_items",
            line_items: [
              lineItemState({ quantity: 1 }),
              lineItemState({ quantity: 2 }),
            ],
            fulfillments: [],
          }
          shippoService = makeShippoService(state)
          makeShippoHelper(state)
        })
        const id = "local_order_has_line_items"

        test("returns packer output", async () => {
          // act
          const result = await shippoService.package
            .for(["local_order", id])
            .fetch()

          // assert
          expect(result[0]).toContainKey("packer_output")
        })
      })

      describe("cart", () => {
        describe("has items", () => {
          beforeEach(() => {
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
            shippoService = makeShippoService(state)
            makeShippoHelper(state)
          })
          const id = "cart_has_address_items_email"

          test("returns packer output", async () => {
            // act
            const result = await shippoService.package.for(["cart", id]).fetch()

            // assert
            expect(result[0]).toContainKey("packer_output")
          })
        })
      })

      describe("line_items", () => {
        test("returns packer output", async () => {
          // arrange
          const state = {}
          const shippoService = makeShippoService(state)
          const lineItems = ["1", "2", "3"].map((quantity) =>
            lineItemStub(lineItemState({ quantity }))
          )
          makeShippoHelper(state)

          // act
          const result = await shippoService.package
            .for(["line_items", lineItems])
            .fetch()

          // expect(result).toBeArray()
          expect(result[0]).toContainKey("packer_output")
        })
      })

      describe("fulfillment", () => {
        test("returns packer output", async () => {
          // arrange
          const state = {
            ...defaultIds(),
            line_items: [
              lineItemState({ quantity: 1 }),
              lineItemState({ quantity: 2 }),
            ],
            fulfillments: [fulfillmentState("has_shippo_order")],
          }
          const shippoService = makeShippoService(state)
          makeShippoHelper(state)

          const id = "ful_has_shippo_order"

          // act
          const result = await shippoService.package
            .for(["fulfillment", id])
            .fetch()

          // assert
          expect(result[0]).toContainKey("packer_output")
        })
      })
    })

    describe("set", () => {
      test("used set boxes", async () => {
        // arrange
        const state = {
          ...defaultIds(),
          line_items: [
            lineItemState({ quantity: 1 }),
            lineItemState({ quantity: 2 }),
          ],
          fulfillments: [fulfillmentState("has_shippo_order")],
        }
        const shippoService = makeShippoService(state)
        makeShippoHelper(state)
        const id = "ful_has_shippo_order"

        const packages = userParcelState().map((box) => ({
          ...box,
          name: "box",
        }))

        // act
        shippoService.package.set("boxes", packages)
        const result = await shippoService.package
          .for(["fulfillment", id])
          .get()

        // assert
        expect(result[0]).toContainEntry(["name", "box"])
      })
    })
  })
})
