import { toBeArrayOfSize, toBeFalse, toBeTrue, toContainEntry, toContainKeys } from "jest-extended"
import { makeShippoService } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { orderState } from "../../__mocks__/order"
import { shippoOrderState } from "../../__mocks__/shippo/order"
import { shippoTransactionState } from "../../__mocks__/shippo/transaction"
import { fulfillmentState } from "../../__mocks__/fulfillment";

expect.extend({ toBeArrayOfSize, toBeFalse, toBeTrue, toContainEntry, toContainKeys })

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
          expect(result).toContainKeys(["object_id", "object_state", "label_url"])
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
            variant: "extended",
          })

          // assert
          expect(result).toContainKeys(["object_id", "object_state", "is_return"])
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
                const result = await shippoService.transaction.fetchBy(
                  ["fulfillment", id]
                )

                // assert
                expect(result).toBeArrayOfSize(1)
              })

              test("returns default transaction", async () => {
                // arrange
                const { id } = fulfillmentState("has_transaction_for_label")

                // act
                const result = await shippoService.transaction.fetchBy(
                  ["fulfillment", id]
                )

                // assert
                expect(result[0]).toContainKeys(["object_id", "object_state", "label_url"])
              })
            })

            describe("variant: extended", () => {
              test("returns array with 1 member", async () => {
                // arrange
                const { id } = fulfillmentState("has_transaction_for_label")

                // act
                const result = await shippoService.transaction.fetchBy(
                  ["fulfillment", id], { type: "extended" }
                )

                // assert
                expect(result).toBeArrayOfSize(1)
              })

              test("returns extended transaction", async () => {
                // arrange
                const { id } = fulfillmentState("has_transaction_for_label")

                // act
                const result = await shippoService.transaction.fetchBy(
                  ["fulfillment", id], { type: "extended" }
                )

                // assert
                expect(result[0]).toContainKeys(["object_id", "object_state", "is_return"])
              })
            })
          })

          describe("has transaction for label and return", () => {
            // arrange
            const shippoService = makeShippoService({
              ...defaultIds(),
              line_items: [],
              fulfillments: [fulfillmentState("has_transaction_for_label_with_return")],
            })
            describe("variant: default", () => {
              test("returns array with 2 members", async () => {
                // arrange
                const { id } = fulfillmentState("has_transaction_for_label_with_return")

                // act
                const result = await shippoService.transaction.fetchBy(
                  ["fulfillment", id]
                )

                // assert
                expect(result).toBeArrayOfSize(2)
              })
            })

            describe("variant: extended", () => {
              test("returns array with 2 members", async () => {
                // arrange
                const { id } = fulfillmentState("has_transaction_for_label_with_return")

                // act
                const result = await shippoService.transaction.fetchBy(
                  ["fulfillment", id], { type: "extended" }
                )

                // assert
                expect(result).toBeArrayOfSize(2)
              })
            })
          })

          describe("variant: extended", () => {
            test("fulfillment returns requested extended transaction", async () => {
              // const result = await shippoService.transaction.fetchBy(
              //   ["fulfillment", "ful_default_id_1"],
              //   { variant: "extended" }
              // )
              // expect(result[0]).toContainEntry(["object_id", "ta_label"])
              // expect(result[1]).toContainEntry(["object_id", "ta_return_label"])
              // expect(result[0].rate).toContainEntry([
              //   "carrier_account",
              //   "carrier_id_here",
              // ])
            })
          })
        })

        describe("local_order", () => {
          describe("variant: default", () => {
            test("returns transaction", async () => {
              // const result = await shippoService.transaction.fetchBy([
              //   "local_order",
              //   "order_default",
              // ])
              // expect(result[0]).toContainEntry([
              //   "fulfillment_id",
              //   "ful_default_id_1",
              // ])
              // expect(result[1]).toContainEntry([
              //   "fulfillment_id",
              //   "ful_default_id_1",
              // ])
              // expect(result[2]).toContainEntry([
              //   "fulfillment_id",
              //   "ful_default_id_2",
              // ])
              // expect(result[3]).toContainEntry([
              //   "fulfillment_id",
              //   "ful_default_id_2",
              // ])
              // expect(result[0]).toContainEntry(["rate", ""])
              // expect(result[1]).toContainEntry(["rate", ""])
              // expect(result[2]).toContainEntry(["rate", ""])
              // expect(result[3]).toContainEntry(["rate", ""])
            })
          })

          describe("variant: extended", () => {
            test("returns transaction", async () => {
              // const result = await shippoService.transaction.fetchBy(
              //   ["local_order", "order_default"],
              //   {
              //     variant: "extended",
              //   }
              // )
              // expect(result[0]).toContainEntry(["object_id", "ta_label"])
              // expect(result[0].rate).toContainEntry([
              //   "carrier_account",
              //   "carrier_id_here",
              // ])
              // expect(result[1]).toContainEntry(["object_id", "ta_return_label"])
              // expect(result[1].rate).toContainEntry([
              //   "carrier_account",
              //   "carrier_id_here",
              // ])
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
            // const id = "ta_label"
            // const result = await shippoService
            //   .is(["transaction", id], "return")
            //   .fetch()
            // expect(result).toBeFalse()
          })
          test("is true", async () => {
            // const id = "ta_return_label"
            // const result = await shippoService
            //   .is(["transaction", id], "return")
            //   .fetch()
            // expect(result).toBeTrue()
          })
        })
      })
    })
})
