import { toContainKey, toContainEntries, toContainEntry } from "jest-extended"
import { makeShippoService } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { orderState } from "../../__mocks__/order"
import { shippoOrderState } from "../../__mocks__/shippo/order"
import { shippoTransactionState } from "../../__mocks__/shippo/transaction"

expect.extend({ toContainKey, toContainEntries, toContainEntry })

const mockShippoClient = shippoClientMock({
  order: shippoOrderState({ order_number: "11" }).default,
  transaction: shippoTransactionState({ order_number: "11" }),
})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("packingslip", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const shippoService = makeShippoService(
    orderState({ display_id: "11" }).default
  )

  describe("fetch", () => {
    test("returns packing slip", async () => {
      const id = "shippo_order_default_id_1"
      const result = await shippoService.packingslip.fetch(id)
      expect(result).toContainKey("slip_url")
    })
  })

  describe("fetchBy", () => {
    describe("fulfillment", () => {
      test("returns packing slip", async () => {
        const id = "ful_default_id_1"
        const result = await shippoService.packingslip.fetchBy([
          "fulfillment",
          id,
        ])
        expect(result).toContainKey("slip_url")
      })
    })

    describe("local_order", () => {
      test("returns packing slip", async () => {
        const id = "order_default"
        const result = await shippoService.packingslip.fetchBy([
          "local_order",
          id,
        ])
        expect(result[0]).toContainEntries([
          ["fulfillment_id", "ful_default_id_1"],
          ["shippo_order_id", "shippo_order_default_id_1"],
        ])
        expect(result[1]).toContainEntries([
          ["fulfillment_id", "ful_default_id_2"],
          ["shippo_order_id", "shippo_order_default_id_2"],
        ])
      })
    })

    describe("claim", () => {
      test("returns packing slip", async () => {
        const id = "claim_01234567890"
        const result = await shippoService.packingslip.fetchBy(["claim", id])
        expect(result[0]).toContainEntries([
          ["fulfillment_id", "ful_default_id_1"],
          ["shippo_order_id", "shippo_order_default_id_1"],
        ])
        expect(result[1]).toContainEntries([
          ["fulfillment_id", "ful_default_id_2"],
          ["shippo_order_id", "shippo_order_default_id_2"],
        ])
      })

      describe("swap", () => {
        test("returns packing slip", async () => {
          const id = "swap_01234567890"
          const result = await shippoService.packingslip.fetchBy(["swap", id])
          expect(result[0]).toContainEntries([
            ["fulfillment_id", "ful_default_id_1"],
            ["shippo_order_id", "shippo_order_default_id_1"],
          ])
          expect(result[1]).toContainEntries([
            ["fulfillment_id", "ful_default_id_2"],
            ["shippo_order_id", "shippo_order_default_id_2"],
          ])
        })
      })
    })

    describe("with", () => {
      describe("fulfillment", () => {
        describe("fetch", () => {
          test("returns packing slip", async () => {
            const id = "shippo_order_default_id_1"
            const result = await shippoService.packingslip
              .with(["fulfillment"])
              .fetch(id)
            expect(result).toContainKey("slip_url")
            expect(result.fulfillment).toContainEntry([
              "id",
              "ful_default_id_1",
            ])
          })
        })
      })
    })
  })
})
