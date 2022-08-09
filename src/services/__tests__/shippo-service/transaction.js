import { toBeFalse, toBeTrue, toContainEntry } from "jest-extended"
import { makeShippoService } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { orderState } from "../../__mocks__/order"
import { shippoOrderState } from "../../__mocks__/shippo/order"
import { shippoTransactionState } from "../../__mocks__/shippo/transaction"

expect.extend({ toBeFalse, toBeTrue, toContainEntry })

const mockShippoClient = shippoClientMock({
  order: shippoOrderState({ order_number: "11" }).has_return_label,
  transaction: shippoTransactionState({ order_number: "11" }),
})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("transaction", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const shippoService = makeShippoService(
    orderState({ display_id: "11" }).default
  )

  describe("fetch", () => {
    it("returns requested default transaction", async () => {
      const result = await shippoService.transaction.fetch("ta_label")
      expect(result).toContainEntry(["object_id", "ta_label"])
      expect(result).toContainEntry(["rate", ""])
    })

    it("returns requested extended transaction", async () => {
      const result = await shippoService.transaction.fetch("ta_label", {
        variant: "extended",
      })
      expect(result).toContainEntry(["object_id", "ta_label"])
      expect(result.rate).toContainEntry(["carrier_account", "carrier_id_here"])
    })
  })

  describe("fetchBy", () => {
    describe("fulfillment", () => {
      describe("variant: default", () => {
        test("returns transaction", async () => {
          const result = await shippoService.transaction.fetchBy([
            "fulfillment",
            "ful_default_id_1",
          ])

          expect(result[0]).toContainEntry(["object_id", "ta_label"])
          expect(result[1]).toContainEntry(["object_id", "ta_return_label"])
          expect(result[0]).toContainEntry(["rate", ""])
          expect(result[1]).toContainEntry(["rate", ""])
        })
      })

      describe("variant: extended", () => {
        test("fulfillment returns requested extended transaction", async () => {
          const result = await shippoService.transaction.fetchBy(
            ["fulfillment", "ful_default_id_1"],
            { variant: "extended" }
          )
          expect(result[0]).toContainEntry(["object_id", "ta_label"])
          expect(result[1]).toContainEntry(["object_id", "ta_return_label"])
          expect(result[0].rate).toContainEntry([
            "carrier_account",
            "carrier_id_here",
          ])
        })
      })
    })

    describe("local_order", () => {
      describe("variant: default", () => {
        test("returns transaction", async () => {
          const result = await shippoService.transaction.fetchBy([
            "local_order",
            "order_default",
          ])
          expect(result[0]).toContainEntry([
            "fulfillment_id",
            "ful_default_id_1",
          ])
          expect(result[1]).toContainEntry([
            "fulfillment_id",
            "ful_default_id_1",
          ])
          expect(result[2]).toContainEntry([
            "fulfillment_id",
            "ful_default_id_2",
          ])
          expect(result[3]).toContainEntry([
            "fulfillment_id",
            "ful_default_id_2",
          ])
          expect(result[0]).toContainEntry(["rate", ""])
          expect(result[1]).toContainEntry(["rate", ""])
          expect(result[2]).toContainEntry(["rate", ""])
          expect(result[3]).toContainEntry(["rate", ""])
        })
      })

      describe("variant: extended", () => {
        test("returns transaction", async () => {
          const result = await shippoService.transaction.fetchBy(
            ["local_order", "order_default"],
            {
              variant: "extended",
            }
          )
          expect(result[0]).toContainEntry(["object_id", "ta_label"])
          expect(result[0].rate).toContainEntry([
            "carrier_account",
            "carrier_id_here",
          ])
          expect(result[1]).toContainEntry(["object_id", "ta_return_label"])
          expect(result[1].rate).toContainEntry([
            "carrier_account",
            "carrier_id_here",
          ])
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
        const id = "ta_label"
        const result = await shippoService
          .is(["transaction", id], "return")
          .fetch()
        expect(result).toBeFalse()
      })
      test("is true", async () => {
        const id = "ta_return_label"
        const result = await shippoService
          .is(["transaction", id], "return")
          .fetch()
        expect(result).toBeTrue()
      })
    })
  })
})
