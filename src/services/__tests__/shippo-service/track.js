import { toContainEntries, toContainKeys } from "jest-extended"
import { makeShippoService } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { orderState } from "../../__mocks__/order"
import { shippoOrderState } from "../../__mocks__/shippo/order"
import { shippoTransactionState } from "../../__mocks__/shippo/transaction"

expect.extend({ toContainEntries, toContainKeys })

const mockShippoClient = shippoClientMock({
  order: shippoOrderState({ order_number: "11" }).has_label,
  transaction: shippoTransactionState({ order_number: "11" }),
})

jest.mock("shippo", () => () => mockShippoClient)

describe("track", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const shippoService = makeShippoService(
    orderState({ display_id: "11" }).default
  )
  test("fetch returns requested track", async () => {
    const result = await shippoService.track.fetch("usps", "track_num_1")
    expect(result).toContainEntries([
      ["tracking_number", "track_num_1"],
      ["carrier", "usps"],
    ])
  })

  test("fetchBy ful_id returns requested track", async () => {
    const result = await shippoService.track.fetchBy([
      "fulfillment",
      "ful_default_id_1",
    ])
    expect(result).toContainKeys(["tracking_number", "carrier"])
  })
})
