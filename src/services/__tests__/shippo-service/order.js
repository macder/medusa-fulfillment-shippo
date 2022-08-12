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
import { lineItemState } from "../../__mocks__/line-item"

import { orderState } from "../../__mocks__/order"
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
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  describe("order", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
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
              line_items: [],
              fulfillments: [fulfillmentState("has_shippo_order")],
            })
            const { id } = fulfillmentState("has_shippo_order")

            // act
            const result = await shippoService.order.fetchBy([
              "fulfillment",
              id,
            ])

            // // assert
            expect(result).toContainKeys(["object_id", "transactions"])
          })
        })

        describe("no shippo order", () => {
          test("returns Promise.reject", async () => {
            // arrange
            const shippoService = makeShippoService({
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
            // arrange
            const shippoService = makeShippoService({
              line_items: [],
              fulfillments: [fulfillmentState("no_shippo_order")],
            })
            const id = "order_id"

            test("returns promise.reject with medusa error", async () => {
              // act
              const result = shippoService.order.fetchBy(["local_order", id])
              // assert
              expect(result).rejects.toContainKeys(["type", "code", "message"])
            })
          })

          describe("with multiple shippo orders", () => {
            // test("returns array", async () => {
            //   // arrange
            //   const shippoService = makeShippoService({
            //     line_items: [],
            //     fulfillments: [fulfillmentState("has_shippo_order")],
            //   })
            //   const id = "order_id"
            //   // act
            //   const result = await shippoService.order.fetchBy([
            //     "local_order",
            //     id,
            //   ])
            //   // assert
            //   expect(result).toBeArray()
          })
        })
      })

      test("returns", async () => {
        // arrange
        // const shippoService = makeShippoService({
        //   ...orderState("default")({ display_id: "11" }),
        //   fulfillments: [fulfillmentState("ful_has_transaction_for_label")],
        // })
        // const id = "order_default"
        // // act
        // const result = await shippoService.order.fetchBy(["local_order", id])
        // // assert
        // expect(result).toBeArray()
        // expect(result[0]).toContainEntry([
        //   "fulfillment_id",
        //   "ful_has_transaction_for_label",
        // ])
      })
    })

    describe("claim", () => {
      test("returns", async () => {
        // const shippoService = makeShippoService({
        //   order_id: "order_default",
        //   display_id: "11",
        //   cart_id: "cart_default_id",
        //   claim_order_id: null,
        //   swap_id: null,
        //   fulfillments: [
        //     fulfillmentState("ful_has_transaction_for_label")],
        // })
        // const result = await shippoService.order.fetchBy(["claim", id])
        // expect(result).toBeArray()
        // expect(result[0]).toContainEntry([
        //   "fulfillment_id",
        //   "ful_default_id_1",
        // ])
      })
    })

    describe("swap", () => {
      test("returns", async () => {
        const id = "swap_01234567890"
        // const result = await shippoService.order.fetchBy(["swap", id])
        // expect(result).toBeArray()
        // expect(result[0]).toContainEntry([
        //   "fulfillment_id",
        //   "ful_default_id_1",
        // ])
      })
    })
  })

  describe("with", () => {
    describe("fulfillment", () => {
      describe("fetch", () => {
        test("returns with fulfillment", async () => {
          const id = "shippo_order_default_id_1"
          // const result = await shippoService.order
          //   .with(["fulfillment"])
          //   .fetch(id)
          // expect(result).toContainKey("object_id")
          // expect(result.fulfillment).toContainEntry([
          //   "id",
          //   "ful_default_id_1",
          // ])
        })
      })
    })
  })

  describe("is", () => {
    describe("type", () => {
      describe("replace", () => {
        it("returns false", async () => {
          const id = "shippo_order_default_id_1"
          // const result = await shippoService
          //   .is(["order", id], "replace")
          //   .fetch()
          // expect(result).toBeFalse()
        })
        // it("returns true", async () => {
        //   const id = "shippo_order_09876543210"
        //   const result = await shippoService
        //     .is(["order", id], "replace")
        //     .fetch()
        //   expect(result).toBeTrue()
        // })
      })
    })
  })
})
