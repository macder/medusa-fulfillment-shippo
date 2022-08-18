import {
  toBeArray,
  toBeArrayOfSize,
  toBeFalse,
  toContainKey,
  toContainKeys,
  toContainEntry,
} from "jest-extended"

import { fulfillmentState } from "../../__mocks__/fulfillment"
import { makeShippoService } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { shippoOrderState } from "../../__mocks__/shippo/order"
import { shippoTransactionState } from "../../__mocks__/shippo/transaction"

expect.extend({
  toBeArray,
  toBeArrayOfSize,
  toBeFalse,
  toContainKey,
  toContainKeys,
  toContainEntry,
})

const mockShippoClient = shippoClientMock({
  order: shippoOrderState,
  transaction: shippoTransactionState,
})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("shippoService", () => {
  describe("order", () => {
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

    describe("fetch", () => {
      describe("id", () => {
        test("returns", async () => {
          // arrange
          const shippoService = makeShippoService({})
          const id = "shippo_order_has_transaction_for_label"

          // act
          const result = await shippoService.order.fetch(id)

          // assert
          expect(result).toContainKeys(["object_id", "transactions"])
        })
      })
    })

    describe("fetchBy", () => {
      describe("fulfillment", () => {
        describe("has shippo order", () => {
          test("returns", async () => {
            // arrange
            const shippoService = makeShippoService({
              ...defaultIds(),
              line_items: [],
              fulfillments: [fulfillmentState("has_shippo_order")],
            })
            const { id } = fulfillmentState("has_shippo_order")

            // act
            const result = await shippoService.order.fetchBy([
              "fulfillment",
              id,
            ])

            // assert
            expect(result).toContainKeys(["object_id", "transactions"])
          })
        })

        describe("no shippo order", () => {
          test("returns Promise.reject", async () => {
            // arrange
            const shippoService = makeShippoService({
              ...defaultIds(),
              line_items: [],
              fulfillments: [fulfillmentState("no_shippo_order")],
            })
            const { id } = fulfillmentState("no_shippo_order")

            // act
            const result = shippoService.order.fetchBy(["fulfillment", id])

            // assert
            expect(result).rejects.toContainKeys(["type", "code", "message"])
          })
        })
      })

      describe("local_order", () => {
        describe("has single fulfillment", () => {
          describe("with shippo order", () => {
            // arrange
            const shippoService = makeShippoService({
              ...defaultIds(),
              line_items: [],
              fulfillments: [fulfillmentState("has_shippo_order")],
            })
            const id = "order_id"

            test("returns array with 1 member", async () => {
              // act
              const result = await shippoService.order.fetchBy([
                "local_order",
                id,
              ])
              // assert
              expect(result).toBeArrayOfSize(1)
            })

            test("return has prop/value pair for fulfillment_id", async () => {
              // act
              const result = await shippoService.order.fetchBy([
                "local_order",
                id,
              ])
              // assert
              expect(result[0]).toContainEntry([
                "fulfillment_id",
                "ful_has_shippo_order",
              ])
            })
          })

          describe("without shippo order", () => {
            test("returns promise.reject with medusa error", async () => {
              // arrange
              const shippoService = makeShippoService({
                ...defaultIds(),
                line_items: [],
                fulfillments: [fulfillmentState("no_shippo_order")],
              })
              const id = "order_id"
              // act
              const result = shippoService.order.fetchBy(["local_order", id])
              // assert
              expect(result).rejects.toContainKeys(["type", "code", "message"])
            })
          })
        })

        describe("has multiple fulfillments", () => {
          describe("with shippo orders", () => {
            test("returns array with 2 members", async () => {
              // arrange
              const shippoService = makeShippoService({
                line_items: [],
                fulfillments: [
                  fulfillmentState("has_shippo_order"),
                  fulfillmentState("has_shippo_order"),
                ],
              })
              const id = "order_id"
              // act
              const result = await shippoService.order.fetchBy([
                "local_order",
                id,
              ])
              // assert
              expect(result).toBeArrayOfSize(2)
            })
          })

          describe("1 of 2 has shippo order", () => {
            test("returns array with 1 member", async () => {
              // arrange
              const shippoService = makeShippoService({
                line_items: [],
                fulfillments: [
                  fulfillmentState("has_shippo_order"),
                  fulfillmentState("no_shippo_order"),
                ],
              })
              const id = "order_id"
              // act
              const result = await shippoService.order.fetchBy([
                "local_order",
                id,
              ])
              // assert
              expect(result).toBeArrayOfSize(1)
            })
          })
          describe("without shippo order", () => {
            test("returns promise.reject with medusa error", async () => {
              // arrange
              const shippoService = makeShippoService({
                ...defaultIds(),
                line_items: [],
                fulfillments: [
                  fulfillmentState("no_shippo_order"),
                  fulfillmentState("no_shippo_order"),
                ],
              })
              const id = "order_id"
              // act
              const result = shippoService.order.fetchBy(["local_order", id])
              // assert
              expect(result).rejects.toContainKeys(["type", "code", "message"])
            })
          })
        })
      })

      describe("claim", () => {
        const claimIds = () => ({
          ...defaultIds(),
          claim_order_id: "claim_123",
        })

        test("returns array with member", async () => {
          // arrange
          const shippoService = makeShippoService({
            ...claimIds(),
            line_items: [],
            fulfillments: [fulfillmentState("has_shippo_order")],
          })

          // act
          const result = await shippoService.order.fetchBy([
            "claim",
            claimIds().claim_order_id,
          ])

          // assert
          expect(result).toBeArrayOfSize(1)
        })
      })

      describe("swap", () => {
        const swapIds = () => ({
          ...defaultIds(),
          swap_id: "swap_123",
        })

        test("returns array with member", async () => {
          // arrange
          const shippoService = makeShippoService({
            ...swapIds(),
            line_items: [],
            fulfillments: [fulfillmentState("has_shippo_order")],
          })

          // act
          const result = await shippoService.order.fetchBy([
            "swap",
            swapIds().swap_id,
          ])

          // assert
          expect(result).toBeArrayOfSize(1)
        })
      })
    })

    describe("with", () => {
      describe("fulfillment", () => {
        describe("fetch", () => {
          test("returns with fulfillment", async () => {
            // arrange
            const shippoService = makeShippoService({
              ...defaultIds(),
              line_items: [],
              fulfillments: [fulfillmentState("has_shippo_order")],
            })
            const id = "shippo_order_no_transactions"

            // act
            const result = await shippoService.order
              .with(["fulfillment"])
              .fetch(id)

            // assert
            expect(result).toContainKey("object_id")
            expect(result.fulfillment).toContainEntry([
              "id",
              "ful_has_shippo_order",
            ])
          })
        })
      })
    })

    describe("is", () => {
      describe("type", () => {
        describe("replace", () => {
          it("returns false", async () => {
            // arrange
            const shippoService = makeShippoService({
              ...defaultIds(),
              line_items: [],
              fulfillments: [fulfillmentState("has_shippo_order")],
            })
            const id = "shippo_order_no_transactions"

            // act
            const result = await shippoService
              .is(["order", id], "replace")
              .fetch()

            // assert
            expect(result).toBeFalse()
          })

          it("returns true", async () => {
            // arrange
            const shippoService = makeShippoService({
              ...defaultIds(),
              line_items: [],
              fulfillments: [fulfillmentState("has_shippo_order")],
            })
            const id = "shippo_order_no_transactions"

            // act
            const result = await shippoService
              .is(["order", id], "replace")
              .fetch()

            // assert
            expect(result).toBeFalse()
          })
        })
      })
    })
  })
})
