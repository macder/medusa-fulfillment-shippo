import {
  toBeArrayOfSize,
  toContainKey,
  toContainKeys,
  toContainEntries,
  toContainEntry,
} from "jest-extended"
import { fulfillmentState } from "../../__mocks__/fulfillment"
import { makeShippoHelper, makeShippoService } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { shippoOrderState } from "../../__mocks__/shippo/order"
import { shippoTransactionState } from "../../__mocks__/shippo/transaction"

expect.extend({
  toBeArrayOfSize,
  toContainKey,
  toContainKeys,
  toContainEntries,
  toContainEntry,
})

const mockShippoClient = shippoClientMock({
  order: shippoOrderState,
  transaction: shippoTransactionState,
})

jest.mock("@macder/shippo", () => () => mockShippoClient)
describe("shippoService", () => {
  describe("packingslip", () => {
    const defaultIds = () => ({
      order_id: "order_default",
      display_id: "11",
      cart_id: "cart_default_id",
      claim_order_id: null,
      swap_id: null,
    })
    let shippoService

    describe("fetch", () => {
      test("returns", async () => {
        // arrange
        const shippoService = makeShippoService({})
        makeShippoHelper({})

        const id = "shippo_order_has_transaction_for_label"

        // act
        const result = await shippoService.packingslip.fetch(id)

        // assert
        expect(result).toContainKey("slip_url")
      })
    })

    describe("fetchBy", () => {
      describe("fulfillment", () => {
        describe("has shippo order", () => {
          beforeEach(() => {
            const state = {
              ...defaultIds(),
              line_items: [],
              fulfillments: [fulfillmentState("has_shippo_order")],
            }
            shippoService = makeShippoService(state)
            makeShippoHelper(state)
          })
          const { id } = fulfillmentState("has_shippo_order")

          test("returns", async () => {
            const result = await shippoService.packingslip.fetchBy([
              "fulfillment",
              id,
            ])

            // assert
            expect(result).toContainKey("slip_url")
          })
        })

        describe("with no shippo order", () => {
          beforeEach(() => {
            const state = {
              ...defaultIds(),
              line_items: [],
              fulfillments: [fulfillmentState("no_shippo_order")],
            }
            shippoService = makeShippoService(state)
            makeShippoHelper(state)
          })
          const { id } = fulfillmentState("no_shippo_order")

          test("returns Promise.reject", async () => {
            // act
            const result = shippoService.packingslip.fetchBy([
              "fulfillment",
              id,
            ])

            // assert
            expect(result).rejects.toContainKeys(["type", "code", "message"])
          })
        })
      })

      describe("local_order", () => {
        describe("has single fulfillment", () => {
          describe("with shippo order", () => {
            beforeEach(() => {
              const state = {
                ...defaultIds(),
                line_items: [],
                fulfillments: [fulfillmentState("has_shippo_order")],
              }
              shippoService = makeShippoService(state)
              makeShippoHelper(state)
            })

            test("returns array with 1 member", async () => {
              // arrange
              const id = "local_order_has_fulfillment_with_shippo_order"

              // act
              const result = await shippoService.packingslip.fetchBy([
                "local_order",
                id,
              ])

              // assert
              expect(result).toBeArrayOfSize(1)
            })

            test("return has prop/value pair for fulfillment_id", async () => {
              // arrange
              const id = "local_order_has_fulfillment_with_shippo_order"

              // act
              const result = await shippoService.packingslip.fetchBy([
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

          describe("with no shippo order", () => {
            test("returns Promise.reject", async () => {
              // arrange
              const state = {
                ...defaultIds(),
                line_items: [],
                fulfillments: [fulfillmentState("no_shippo_order")],
              }
              shippoService = makeShippoService(state)
              makeShippoHelper(state)

              const id = "local_order_has_fulfillment_with_no_shippo_order"

              // act
              const result = shippoService.packingslip.fetchBy([
                "local_order",
                id,
              ])

              // assert
              expect(result).rejects.toContainKeys(["type", "code", "message"])
            })
          })
        })

        describe("has multi fulfillments", () => {
          describe("with shippo orders", () => {
            test("returns array with 2 members", async () => {
              // arrange
              const state = {
                ...defaultIds(),
                line_items: [],
                fulfillments: [
                  fulfillmentState("has_shippo_order"),
                  fulfillmentState("has_shippo_order"),
                ],
              }
              const shippoService = makeShippoService(state)
              makeShippoHelper(state)

              const id = "local_order_has_multi_fulfillments_with_shippo_orders"

              // act
              const result = await shippoService.packingslip.fetchBy([
                "local_order",
                id,
              ])

              // assert
              expect(result).toBeArrayOfSize(2)
            })
          })

          describe("with and withuot shippo orders", () => {
            test("returns array with 1 member", async () => {
              // arrange
              const state = {
                ...defaultIds(),
                line_items: [],
                fulfillments: [
                  fulfillmentState("has_shippo_order"),
                  fulfillmentState("no_shippo_order"),
                ],
              }
              const shippoService = makeShippoService(state)
              makeShippoHelper(state)

              const id =
                "local_order_has_multi_fulfillments_with_and_without_shippo_orders"

              // act
              const result = await shippoService.packingslip.fetchBy([
                "local_order",
                id,
              ])

              // assert
              expect(result).toBeArrayOfSize(1)
            })
          })
        })
      })

      describe("claim", () => {
        test("returns packingslip", async () => {
          // arrange
          const state = {
            ...defaultIds(),
            claim_order_id: "claim_id_11",
            line_items: [],
            fulfillments: [fulfillmentState("has_shippo_order")],
          }
          const shippoService = makeShippoService(state)
          makeShippoHelper(state)

          const id = "claim_id_11"

          // act
          const result = await shippoService.packingslip.fetchBy(["claim", id])

          // assert
          expect(result[0]).toContainKey("slip_url")
        })

        describe("swap", () => {
          test("", async () => {
            // arrange
            const state = {
              ...defaultIds(),
              swap_id: "swap_id_11",
              line_items: [],
              fulfillments: [fulfillmentState("has_shippo_order")],
            }
            const shippoService = makeShippoService(state)
            makeShippoHelper(state)

            const id = "swap_id_11"

            // act
            const result = await shippoService.packingslip.fetchBy(["swap", id])

            // assert
            expect(result[0]).toContainKey("slip_url")
          })
        })
      })

      describe("with", () => {
        describe("fulfillment", () => {
          describe("has shippo order", () => {
            beforeEach(() => {
              const state = {
                ...defaultIds(),
                line_items: [],
                fulfillments: [fulfillmentState("has_shippo_order")],
              }
              shippoService = makeShippoService(state)
              makeShippoHelper(state)
            })

            test("returns packing slip", async () => {
              // arrange
              const { id } = fulfillmentState("has_shippo_order")

              // act
              const result = await shippoService.packingslip
                .with(["fulfillment"])
                .fetch(id)

              // assert
              expect(result).toContainKey("slip_url")
            })

            test("returns has fulfillment", async () => {
              // arrange
              const { id } = fulfillmentState("has_shippo_order")

              // act
              const result = await shippoService.packingslip
                .with(["fulfillment"])
                .fetch(id)

              // assert
              expect(result.fulfillment).toContainEntry([
                "id",
                "ful_has_shippo_order",
              ])
            })
          })
        })
      })
    })
  })
})
