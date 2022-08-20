import { toContainEntries, toContainKeys } from "jest-extended"
import { makeShippoHelper, makeShippoService } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { fulfillmentState } from "../../__mocks__/fulfillment"
import { shippoOrderState } from "../../__mocks__/shippo/order"
import { shippoTransactionState } from "../../__mocks__/shippo/transaction"

expect.extend({ toContainEntries, toContainKeys })

const mockShippoClient = shippoClientMock({
  order: shippoOrderState,
  transaction: shippoTransactionState,
})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("track", () => {
  const defaultIds = () => ({
    order_id: "order_default",
    display_id: "11",
    cart_id: "cart_default_id",
    claim_order_id: null,
    swap_id: null,
  })

  test("fetch returns requested track", async () => {
    // arrange
    const shippoService = makeShippoService({})
    makeShippoHelper({})
    // act
    const result = await shippoService.track.fetch("usps", "track_num_1")

    // assert
    expect(result).toContainEntries([
      ["tracking_number", "track_num_1"],
      ["carrier", "usps"],
    ])
  })

  test("fetchBy ful_id returns requested track", async () => {
    // arrange
    const state = {
      ...defaultIds(),
      line_items: [],
      fulfillments: [fulfillmentState("has_transaction_for_label")],
    }
    const shippoService = makeShippoService(state)
    makeShippoHelper(state)

    const { id } = fulfillmentState("has_transaction_for_label")

    // act
    const result = await shippoService.track.fetchBy(["fulfillment", id])

    // assert
    expect(result).toContainKeys(["tracking_number", "carrier"])
  })
})
