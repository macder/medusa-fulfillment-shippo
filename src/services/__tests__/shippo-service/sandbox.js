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

  describe("fetchBy", () => {
    describe("fulfillment", () => {
      describe("has transaction for label", () => {
        const id = () => fulfillmentState("has_transaction_for_label").id
        let shippoService

        beforeEach(() => {
          const state = {
            ...defaultIds(),
            line_items: [],
            fulfillments: [fulfillmentState("has_transaction_for_label")],
          }
          shippoService = makeShippoService(state)
          makeShippoHelper(state)
        })

        describe("type: default", () => {
          const fetchByFulfillment = async (fulfillmentId) =>
            shippoService.transaction.fetchBy(["fulfillment", fulfillmentId])

          test("returns array with 1 member", async () => {
            const result = await fetchByFulfillment(id())
            expect(result).toBeArrayOfSize(1)
          })

          test("returns default transaction", async () => {
            const result = await fetchByFulfillment(id())
            expect(result[0]).toContainKeys([
              "object_id",
              "object_state",
              "label_url",
            ])
          })
        })

        describe("type: extended", () => {
          const fetchByFulfillment = async (fulfillmentId) =>
            shippoService.transaction.fetchBy(["fulfillment", fulfillmentId], {
              type: "extended",
            })

          test("returns array with 1 member", async () => {
            const result = await fetchByFulfillment(id())
            expect(result).toBeArrayOfSize(1)
          })

          test("returns extended transaction", async () => {
            const result = await fetchByFulfillment(id())
            expect(result[0]).toContainKeys([
              "object_id",
              "object_state",
              "is_return",
            ])
          })
        })
      })
    })
  })
})
