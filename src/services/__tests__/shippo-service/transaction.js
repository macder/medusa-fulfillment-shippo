import {
  toBeArrayOfSize,
  toBeFalse,
  toBeTrue,
  toContainEntry,
  toContainKeys,
} from "jest-extended"
import { makeShippoService, makeShippoHelper } from "../setup"
import { shippoClientMock } from "../../__mocks__"

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

describe("transaction", () => {
  const defaultIds = () => ({
    order_id: "order_default",
    display_id: "11",
    cart_id: "cart_default_id",
    claim_order_id: null,
    swap_id: null,
  })
  const entityId = ({ id }) => id
  let shippoService

  describe("fetchBy", () => {
    describe("fulfillment", () => {
      const fetchDefaultByFulfillment = (fulfillmentId) =>
        shippoService.transaction.fetchBy(["fulfillment", fulfillmentId])

      const fetchExtendedByFulfillment = (fulfillmentId) =>
        shippoService.transaction.fetchBy(["fulfillment", fulfillmentId], {
          type: "extended",
        })

      describe("has transaction for label", () => {
        beforeEach(() => {
          const state = {
            ...defaultIds(),
            line_items: [],
            fulfillments: [fulfillmentState("has_transaction_for_label")],
          }
          shippoService = makeShippoService(state)
          makeShippoHelper(state)
        })

        const id = () => entityId(fulfillmentState("has_transaction_for_label"))

        describe("type: default", () => {
          test("returns array with 1 member", async () => {
            const result = await fetchDefaultByFulfillment(id())
            expect(result).toBeArrayOfSize(1)
          })

          test("returns default transaction", async () => {
            const result = await fetchDefaultByFulfillment(id())
            expect(result[0]).toContainKeys([
              "object_id",
              "object_state",
              "label_url",
            ])
          })
        })

        describe("type: extended", () => {
          test("returns array with 1 member", async () => {
            const result = await fetchExtendedByFulfillment(id())
            expect(result).toBeArrayOfSize(1)
          })

          test("returns extended transaction", async () => {
            const result = await fetchExtendedByFulfillment(id())
            expect(result[0]).toContainKeys([
              "object_id",
              "object_state",
              "is_return",
            ])
          })
        })
      })

      describe("has transaction for label and return", () => {
        beforeEach(() => {
          const state = {
            ...defaultIds(),
            line_items: [],
            fulfillments: [
              fulfillmentState("has_transaction_for_label_with_return"),
            ],
          }
          shippoService = makeShippoService(state)
          makeShippoHelper(state)
        })

        const id = () =>
          entityId(fulfillmentState("has_transaction_for_label_with_return"))

        describe("type: default", () => {
          test("returns array with 2 members", async () => {
            const result = await fetchDefaultByFulfillment(id())
            expect(result).toBeArrayOfSize(2)
          })
        })

        describe("type: extended", () => {
          test("returns array with 2 members", async () => {
            const result = await fetchExtendedByFulfillment(id())
            expect(result).toBeArrayOfSize(2)
          })
        })
      })

      describe("no shippo order", () => {
        beforeEach(() => {
          const state = {
            ...defaultIds(),
            line_items: [],
            fulfillments: [fulfillmentState("no_shippo_order")],
          }
          shippoService = makeShippoService(state)
          makeShippoHelper(state)
        })

        const id = () => entityId(fulfillmentState("no_shippo_order"))

        describe("type: default", () => {
          test("return promise.reject", async () => {
            const result = fetchDefaultByFulfillment(id())
            expect(result).rejects.toContainKeys(["type", "code", "message"])
          })
        })

        describe("type: extended", () => {
          test("return promise.reject", async () => {
            const result = fetchExtendedByFulfillment(id())
            expect(result).rejects.toContainKeys(["type", "code", "message"])
          })
        })
      })
      describe("no transaction", () => {
        beforeEach(() => {
          const state = {
            ...defaultIds(),
            line_items: [],
            fulfillments: [fulfillmentState("no_transaction")],
          }
          shippoService = makeShippoService(state)
          makeShippoHelper(state)
        })

        const id = () => entityId(fulfillmentState("no_transaction"))

        describe("type: default", () => {
          test("return promise.reject", async () => {
            const result = fetchDefaultByFulfillment(id())
            expect(result).rejects.toContainKeys(["type", "code", "message"])
          })
        })

        describe("type: extended", () => {
          test("return promise.reject", async () => {
            const result = fetchExtendedByFulfillment(id())
            expect(result).rejects.toContainKeys(["type", "code", "message"])
          })
        })
      })
    })

    describe("local_order", () => {
      const fetchDefaultByLocalOrder = (orderId) =>
        shippoService.transaction.fetchBy(["local_order", orderId])

      const fetchExtendedByLocalOrder = (orderId) =>
        shippoService.transaction.fetchBy(["local_order", orderId], {
          type: "extended",
        })

      describe("has single fulfillment", () => {
        describe("with transaction for label", () => {
          beforeEach(() => {
            const state = {
              ...defaultIds(),
              line_items: [],
              fulfillments: [fulfillmentState("has_transaction_for_label")],
            }
            shippoService = makeShippoService(state)
            makeShippoHelper(state)
          })
          const id = "local_order_single_fulfillment_with_transaction_for_label"

          describe("type: default", () => {
            test("returns array with 1 member", async () => {
              const result = await fetchDefaultByLocalOrder(id)
              expect(result).toBeArrayOfSize(1)
            })

            test("return is default transaction", async () => {
              const result = await fetchDefaultByLocalOrder(id)
              expect(result[0]).toContainKeys([
                "object_id",
                "object_state",
                "label_url",
              ])
            })

            test("return has prop/value pair for fulfillment_id", async () => {
              const result = await fetchDefaultByLocalOrder(id)
              expect(result[0]).toContainEntry([
                "fulfillment_id",
                "ful_has_transaction_for_label",
              ])
            })
          })

          describe("type: extended", () => {
            test("returns array with 1 member", async () => {
              const result = await fetchExtendedByLocalOrder(id)
              expect(result).toBeArrayOfSize(1)
            })

            test("return is extended transaction", async () => {
              const result = await fetchExtendedByLocalOrder(id)
              expect(result[0]).toContainKeys([
                "object_id",
                "object_state",
                "is_return",
              ])
            })
          })
        })

        describe("with transaction for label and return", () => {
          beforeEach(() => {
            const state = {
              ...defaultIds(),
              display_id: "22",
              line_items: [],
              fulfillments: [
                fulfillmentState("has_transaction_for_label_with_return"),
              ],
            }
            shippoService = makeShippoService(state)
            makeShippoHelper(state)
          })
          const id =
            "local_order_single_fulfillment_with_transaction_for_label_and_return"

          describe("type: default", () => {
            test("returns array with 2 members", async () => {
              const result = await fetchDefaultByLocalOrder(id)
              expect(result).toBeArrayOfSize(2)
            })
          })

          describe("type: extended", () => {
            test("returns array with 2 members", async () => {
              const result = await fetchExtendedByLocalOrder(id)
              expect(result).toBeArrayOfSize(2)
            })
          })
        })

        describe("with no transaction", () => {
          beforeEach(() => {
            const state = {
              ...defaultIds(),
              display_id: "44",
              line_items: [],
              fulfillments: [fulfillmentState("no_transaction")],
            }
            shippoService = makeShippoService(state)
            makeShippoHelper(state)
          })
          const id = "local_order_single_fulfillment_with_no_transaction"

          describe("type: default", () => {
            test("return promise.reject", async () => {
              const result = fetchDefaultByLocalOrder(id)
              expect(result).rejects.toContainKeys(["type", "code", "message"])
            })
          })

          describe("type: extended", () => {
            test("return promise.reject", async () => {
              const result = fetchExtendedByLocalOrder(id)
              expect(result).rejects.toContainKeys(["type", "code", "message"])
            })
          })
        })

        describe("with no shippo order", () => {
          beforeEach(() => {
            const state = {
              ...defaultIds(),
              display_id: "44",
              line_items: [],
              fulfillments: [fulfillmentState("no_shippo_order")],
            }
            shippoService = makeShippoService(state)
            makeShippoHelper(state)
          })

          const id = "local_order_single_fulfillment_with_no_shippo_order"

          describe("type: default", () => {
            test("return promise.reject", async () => {
              const result = fetchDefaultByLocalOrder(id)
              expect(result).rejects.toContainKeys(["type", "code", "message"])
            })
          })

          describe("type: extended", () => {
            test("return promise.reject", async () => {
              const result = fetchExtendedByLocalOrder(id)
              expect(result).rejects.toContainKeys(["type", "code", "message"])
            })
          })
        })

        describe("has multi fulfillments", () => {
          describe("with a transaction", () => {
            beforeEach(() => {
              const state = {
                ...defaultIds(),
                display_id: "33",
                line_items: [],
                fulfillments: [
                  fulfillmentState("has_transaction_for_label"),
                  fulfillmentState("has_transaction_for_label"),
                ],
              }
              shippoService = makeShippoService(state)
              makeShippoHelper(state)
            })
            const id =
              "local_order_multi_fulfillment_with_transaction_for_label"

            describe("type: default", () => {
              test("returns array with 2 members", async () => {
                const result = await fetchDefaultByLocalOrder(id)
                expect(result).toBeArrayOfSize(2)
              })
            })

            describe("type: extended", () => {
              test("returns array with 2 members", async () => {
                const result = await fetchExtendedByLocalOrder(id)
                expect(result).toBeArrayOfSize(2)
              })
            })
          })
        })
      })
    })
  })
  describe("is", () => {
    describe("return", () => {
      test("is false", async () => {
        const state = {
          ...defaultIds(),
          display_id: "11",
          line_items: [],
          fulfillments: [],
        }
        shippoService = makeShippoService(state)
        makeShippoHelper(state)

        const id = "transaction_for_label"
        const result = await shippoService
          .is(["transaction", id], "return")
          .fetch()
        expect(result).toBeFalse()
      })

      test("is true", async () => {
        // arrange
        const state = {
          ...defaultIds(),
          display_id: "22",
          line_items: [],
          fulfillments: [],
        }
        const shippoService = makeShippoService(state)
        makeShippoHelper(state)
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
