import {
  toBeArrayOfSize,
  toBeFalse,
  toBeTrue,
  toContainEntry,
  toContainKeys,
} from "jest-extended"
import { makeShippoService } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { orderState } from "../../__mocks__/order"
import { shippoOrderState } from "../../__mocks__/shippo/order"
import { shippoTransactionState } from "../../__mocks__/shippo/transaction"
import { fulfillmentState } from "../../__mocks__/fulfillment"

expect.extend({
  toBeArrayOfSize,
  toBeFalse,
  toBeTrue,
  toContainEntry,
  toContainKeys,
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

  describe("transaction", () => {
    const defaultIds = () => ({
      order_id: "order_default",
      display_id: "11",
      cart_id: "cart_default_id",
      claim_order_id: null,
      swap_id: null,
    })

    describe("fetch", () => {
      describe("default", () => {
        test("returns default transaction", async () => {
          // arrange
          const shippoService = makeShippoService({})
          const id = "transaction_for_label"

          // act
          const result = await shippoService.transaction.fetch(id)
          // assert
          expect(result).toContainKeys([
            "object_id",
            "object_state",
            "label_url",
          ])
        })
      })

      describe("extended", () => {
        test("returns extended transaction", async () => {
          // arrange
          const shippoService = makeShippoService({
            ...defaultIds(),
            line_items: [],
            fulfillments: [fulfillmentState("has_transaction_for_label")],
          })
          const id = "transaction_for_label"

          // act
          const result = await shippoService.transaction.fetch(id, {
            type: "extended",
          })

          // assert
          expect(result).toContainKeys([
            "object_id",
            "object_state",
            "is_return",
          ])
        })
      })
    })

    describe("fetchBy", () => {
      describe("fulfillment", () => {
        describe("has transaction for label", () => {
          // arrange
          const shippoService = makeShippoService({
            ...defaultIds(),
            line_items: [],
            fulfillments: [fulfillmentState("has_transaction_for_label")],
          })

          describe("variant: default", () => {
            test("returns array with 1 member", async () => {
              // arrange
              const { id } = fulfillmentState("has_transaction_for_label")

              // act
              const result = await shippoService.transaction.fetchBy([
                "fulfillment",
                id,
              ])

              // assert
              expect(result).toBeArrayOfSize(1)
            })

            test("returns default transaction", async () => {
              // arrange
              const { id } = fulfillmentState("has_transaction_for_label")

              // act
              const result = await shippoService.transaction.fetchBy([
                "fulfillment",
                id,
              ])

              // assert
              expect(result[0]).toContainKeys([
                "object_id",
                "object_state",
                "label_url",
              ])
            })
          })

          describe("variant: extended", () => {
            test("returns array with 1 member", async () => {
              // arrange
              const { id } = fulfillmentState("has_transaction_for_label")

              // act
              const result = await shippoService.transaction.fetchBy(
                ["fulfillment", id],
                { type: "extended" }
              )

              // assert
              expect(result).toBeArrayOfSize(1)
            })

            test("returns extended transaction", async () => {
              // arrange
              const { id } = fulfillmentState("has_transaction_for_label")

              // act
              const result = await shippoService.transaction.fetchBy(
                ["fulfillment", id],
                { type: "extended" }
              )

              // assert
              expect(result[0]).toContainKeys([
                "object_id",
                "object_state",
                "is_return",
              ])
            })
          })
        })

        describe("has transaction for label and return", () => {
          // arrange
          const shippoService = makeShippoService({
            ...defaultIds(),
            line_items: [],
            fulfillments: [
              fulfillmentState("has_transaction_for_label_with_return"),
            ],
          })
          describe("variant: default", () => {
            test("returns array with 2 members", async () => {
              // arrange
              const { id } = fulfillmentState(
                "has_transaction_for_label_with_return"
              )

              // act
              const result = await shippoService.transaction.fetchBy([
                "fulfillment",
                id,
              ])

              // assert
              expect(result).toBeArrayOfSize(2)
            })
          })

          describe("variant: extended", () => {
            test("returns array with 2 members", async () => {
              // arrange
              const { id } = fulfillmentState(
                "has_transaction_for_label_with_return"
              )

              // act
              const result = await shippoService.transaction.fetchBy(
                ["fulfillment", id],
                { type: "extended" }
              )

              // assert
              expect(result).toBeArrayOfSize(2)
            })
          })
        })

        describe("no shippo order", () => {
          // arrange
          const shippoService = makeShippoService({
            ...defaultIds(),
            line_items: [],
            fulfillments: [fulfillmentState("no_shippo_order")],
          })

          describe("variant: default", () => {
            test("return promise.reject", async () => {
              // arrange
              const { id } = fulfillmentState("no_shippo_order")

              // act
              const result = shippoService.transaction.fetchBy([
                "fulfillment",
                id,
              ])

              // assert
              expect(result).rejects.toContainKeys(["type", "code", "message"])
            })
          })

          describe("variant: extended", () => {
            test("return promise.reject", async () => {
              // arrange
              const { id } = fulfillmentState("no_shippo_order")

              // act
              const result = shippoService.transaction.fetchBy(
                ["fulfillment", id],
                { type: "extended" }
              )

              // assert
              expect(result).rejects.toContainKeys(["type", "code", "message"])
            })
          })
        })

        describe("no transaction", () => {
          // arrange
          const shippoService = makeShippoService({
            ...defaultIds(),
            line_items: [],
            fulfillments: [fulfillmentState("no_transaction")],
          })

          describe("variant: default", () => {
            test("return promise.reject", async () => {
              // arrange
              const { id } = fulfillmentState("no_transaction")

              // act
              const result = shippoService.transaction.fetchBy([
                "fulfillment",
                id,
              ])

              // assert
              expect(result).rejects.toContainKeys(["type", "code", "message"])
            })
          })

          describe("variant: extended", () => {
            test("return promise.reject", async () => {
              // arrange
              const { id } = fulfillmentState("no_transaction")

              // act
              const result = shippoService.transaction.fetchBy(
                ["fulfillment", id],
                { type: "extended" }
              )
              // assert
              expect(result).rejects.toContainKeys(["type", "code", "message"])
            })
          })
        })
      })

      describe("local_order", () => {
        describe("has single fulfillment", () => {
          describe("with transaction for label", () => {
            // arrange
            const shippoService = makeShippoService({
              ...defaultIds(),
              line_items: [],
              fulfillments: [fulfillmentState("has_transaction_for_label")],
            })
            describe("variant: default", () => {
              test("returns array with 1 member", async () => {
                // arrange
                const id =
                  "local_order_single_fulfillment_with_transaction_for_label"

                // act
                const result = await shippoService.transaction.fetchBy([
                  "local_order",
                  id,
                ])

                // assert
                expect(result).toBeArrayOfSize(1)
              })

              test("return is default transaction", async () => {
                // arrange
                const id =
                  "local_order_single_fulfillment_with_transaction_for_label"

                // act
                const result = await shippoService.transaction.fetchBy([
                  "local_order",
                  id,
                ])

                // assert
                expect(result[0]).toContainKeys([
                  "object_id",
                  "object_state",
                  "label_url",
                ])
              })

              test("return has prop/value pair for fulfillment_id", async () => {
                // arrange
                const id =
                  "local_order_single_fulfillment_with_transaction_for_label"

                // act
                const result = await shippoService.transaction.fetchBy([
                  "local_order",
                  id,
                ])

                // assert
                expect(result[0]).toContainEntry([
                  "fulfillment_id",
                  "ful_has_transaction_for_label",
                ])
              })
            })

            describe("variant: extended", () => {
              test("returns array with 1 member", async () => {
                // arrange
                const id =
                  "local_order_single_fulfillment_with_transaction_for_label"

                // act
                const result = await shippoService.transaction.fetchBy(
                  ["local_order", id],
                  { type: "extended" }
                )

                // assert
                expect(result).toBeArrayOfSize(1)
              })

              test("return is extended transaction", async () => {
                // arrange
                const id =
                  "local_order_single_fulfillment_with_transaction_for_label"

                // act
                const result = await shippoService.transaction.fetchBy(
                  ["local_order", id],
                  { type: "extended" }
                )

                // assert
                expect(result[0]).toContainKeys([
                  "object_id",
                  "object_state",
                  "is_return",
                ])
              })
            })
          })
          describe("with transaction for label and return", () => {
            // arrange
            const shippoService = makeShippoService({
              ...defaultIds(),
              display_id: "22",
              line_items: [],
              fulfillments: [
                fulfillmentState("has_transaction_for_label_with_return"),
              ],
            })

            describe("variant: default", () => {
              test("returns array with 2 members", async () => {
                // arrange
                const id =
                  "local_order_single_fulfillment_with_transaction_for_label_and_return"

                // act
                const result = await shippoService.transaction.fetchBy([
                  "local_order",
                  id,
                ])

                // assert
                expect(result).toBeArrayOfSize(2)
              })
            })

            describe("variant: extended", () => {
              test("returns array with 2 members", async () => {
                // arrange
                const id =
                  "local_order_single_fulfillment_with_transaction_for_label_and_return"

                // act
                const result = await shippoService.transaction.fetchBy(
                  ["local_order", id],
                  { type: "extended" }
                )

                // assert
                expect(result).toBeArrayOfSize(2)
              })
            })
          })
          describe("with no transaction", () => {
            // arrange
            const shippoService = makeShippoService({
              ...defaultIds(),
              display_id: "44",
              line_items: [],
              fulfillments: [fulfillmentState("no_transaction")],
            })

            describe("variant: default", () => {
              test("return promise.reject", async () => {
                // arrange
                const id = "local_order_single_fulfillment_with_no_transaction"

                // act
                const result = shippoService.transaction.fetchBy([
                  "local_order",
                  id,
                ])

                // assert
                expect(result).rejects.toContainKeys([
                  "type",
                  "code",
                  "message",
                ])
              })
            })

            describe("variant: extended", () => {
              test("return promise.reject", async () => {
                // arrange
                const id = "local_order_single_fulfillment_with_no_transaction"

                // act
                const result = shippoService.transaction.fetchBy(
                  ["local_order", id],
                  { type: "extended" }
                )

                // assert
                expect(result).rejects.toContainKeys([
                  "type",
                  "code",
                  "message",
                ])
              })
            })
          })
        })
        describe("has multi fulfillments", () => {
          describe("with a transaction", () => {
            // arrange
            const shippoService = makeShippoService({
              ...defaultIds(),
              display_id: "33",
              line_items: [],
              fulfillments: [
                fulfillmentState("has_transaction_for_label"),
                fulfillmentState("has_transaction_for_label"),
              ],
            })

            describe("variant: default", () => {
              test("returns array with 2 members", async () => {
                // arrange
                const id =
                  "local_order_multi_fulfillment_with_transaction_for_label"

                // act
                const result = await shippoService.transaction.fetchBy([
                  "local_order",
                  id,
                ])

                // assert
                expect(result).toBeArrayOfSize(2)
              })
            })

            describe("variant: extended", () => {
              test("returns array with 2 members", async () => {
                // arrange
                const id =
                  "local_order_multi_fulfillment_with_transaction_for_label"

                // act
                const result = await shippoService.transaction.fetchBy(
                  ["local_order", id],
                  { type: "extended" }
                )

                // assert
                expect(result).toBeArrayOfSize(2)
              })
            })
          })
        })
      })
    })

    describe("is", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      describe("return", () => {
        test("is false", async () => {
          // arrange
          const shippoService = makeShippoService({
            ...defaultIds(),
            display_id: "11",
            line_items: [],
            fulfillments: [],
          })
          const id = "transaction_for_label"

          // act
          const result = await shippoService
            .is(["transaction", id], "return")
            .fetch()

          // assert
          expect(result).toBeFalse()
        })
        test("is true", async () => {
          // arrange
          const shippoService = makeShippoService({
            ...defaultIds(),
            display_id: "22",
            line_items: [],
            fulfillments: [],
          })
          const id = "transaction_for_return_label"

          // act
          const result = await shippoService
            .is(["transaction", id], "return")
            .fetch()

          // assert
          expect(result).toBeTrue()
        })
      })
    })
  })
})
