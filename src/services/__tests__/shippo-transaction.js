import { toBeNumber, toContainKey, toContainKeys } from "jest-extended"
import { orderState } from "../__mocks__/order"
import { shippoOrderState } from "../__mocks__/shippo/order"
import { shippoTransactionState } from "../__mocks__/shippo/transaction"
import { makeShippoTransactionService } from "./setup"
import { shippoClientMock } from "../__mocks__"

expect.extend({ toBeNumber, toContainKey, toContainKeys })

const mockShippoClient = shippoClientMock({
  order: shippoOrderState({ order_number: "11" }).has_return_label,
  transaction: shippoTransactionState({ order_number: "11" }),
})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("ShippoTransactionService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const shippoTransactionService = makeShippoTransactionService(
    orderState({ display_id: "11" }).default
  )

  describe("pollExtended", () => {
    // test("returns extended transaction", async () => {
    //   const result = await shippoTransactionService.pollExtended("ta_label")
    //   expect(result).toContainKeys(["rate", "is_return"])
    // })
  })

  describe("findFulfillment", () => {
    test("returns fulfillment", async () => {
      const result = await shippoTransactionService.findFulfillment("ta_label")
      expect(result).toContainKey("data")
      expect(result.data).toContainKey("shippo_order_id")
    })
  })
})
