import {
  toBeNumber,
  toContainEntry,
  toContainKey,
  toContainKeys,
} from "jest-extended"
import { shippoOrderState } from "../__mocks__/shippo/order"
import { shippoTransactionState } from "../__mocks__/shippo/transaction"
import {
  makeShippoHelper,
  makeShippoService,
  makeShippoTransactionService,
} from "./setup"
import { shippoClientMock } from "../__mocks__"
import { fulfillmentState } from "../__mocks__/fulfillment"
import { lineItemState } from "../__mocks__/line-item"

expect.extend({ toBeNumber, toContainEntry, toContainKey, toContainKeys })

const mockShippoClient = shippoClientMock({
  order: shippoOrderState,
  transaction: shippoTransactionState,
})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("ShippoTransactionService", () => {
  let shippoTransactionService

  const defaultIds = () => ({
    order_id: "order_default",
    display_id: "11",
    cart_id: "cart_default_id",
    claim_order_id: null,
    swap_id: null,
  })

  describe("pollExtended", () => {
    beforeEach(() => {
      const state = {
        ...defaultIds(),
        line_items: [
          lineItemState({ quantity: 1 }),
          lineItemState({ quantity: 2 }),
        ],
        fulfillments: [fulfillmentState("has_transaction_for_label")],
      }
      shippoTransactionService = makeShippoTransactionService(state)
      makeShippoHelper(state)
    })

    test("returns extended transaction", async () => {
      // act
      const result = await shippoTransactionService.pollExtended(
        "transaction_for_label"
      )

      // assert
      expect(result).toContainKeys(["rate", "is_return"])
    })
  })

  describe("findFulfillment", () => {
    beforeEach(() => {
      const state = {
        ...defaultIds(),
        line_items: [
          lineItemState({ quantity: 1 }),
          lineItemState({ quantity: 2 }),
        ],
        fulfillments: [fulfillmentState("has_transaction_for_label")],
      }
      shippoTransactionService = makeShippoTransactionService(state)
      makeShippoHelper(state)
    })

    test("returns fulfillment", async () => {
      // act
      const result = await shippoTransactionService.findFulfillment(
        "transaction_for_label"
      )
      // assert
      expect(result).toContainEntry(["id", "ful_has_transaction_for_label"])
    })
  })
})
