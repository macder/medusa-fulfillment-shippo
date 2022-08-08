import * as matchers from "jest-extended"
import { makeShippoService } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { orderState } from "../../__mocks__/order"
import { shippoOrderState } from "../../__mocks__/shippo/order"
import { shippoTransactionState } from "../../__mocks__/shippo/transaction"

expect.extend(matchers)

const mockShippoClient = shippoClientMock({
  order: shippoOrderState({ order_number: "11" }).default,
  transaction: shippoTransactionState({ order_number: "11" }),
})

jest.mock("shippo", () => () => mockShippoClient)

describe("shippoService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  describe("order", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoService = makeShippoService(
      orderState({ display_id: "11" }).default
    )

    describe("fetch", () => {
      describe("id", () => {
        test("returns", async () => {
          const id = "shippo_order_default_id_1"
          const result = await shippoService.order.fetch(id)
          expect(result).toContainEntry(["object_id", id])
        })
      })
    })

    describe("fetchBy", () => {
      describe("fulfillment", () => {
        test("returns", async () => {
          const id = "ful_default_id_1"
          const result = await shippoService.order.fetchBy(["fulfillment", id])
          expect(result).toContainEntry([
            "object_id",
            "shippo_order_default_id_1",
          ])
        })
      })

      describe("local_order", () => {
        test("returns", async () => {
          const id = "order_default"
          const result = await shippoService.order.fetchBy(["local_order", id])
          expect(result).toBeArray()
          expect(result[0]).toContainEntry([
            "fulfillment_id",
            "ful_default_id_1",
          ])
        })
      })

      describe("claim", () => {
        test("returns", async () => {
          const id = "claim_01234567890"
          const result = await shippoService.order.fetchBy(["claim", id])
          expect(result).toBeArray()
          expect(result[0]).toContainEntry([
            "fulfillment_id",
            "ful_default_id_1",
          ])
        })
      })

      describe("swap", () => {
        test("returns", async () => {
          const id = "swap_01234567890"
          const result = await shippoService.order.fetchBy(["swap", id])
          expect(result).toBeArray()
          expect(result[0]).toContainEntry([
            "fulfillment_id",
            "ful_default_id_1",
          ])
        })
      })
    })

    describe("with", () => {
      describe("fulfillment", () => {
        describe("fetch", () => {
          test("returns with fulfillment", async () => {
            const id = "shippo_order_default_id_1"
            const result = await shippoService.order
              .with(["fulfillment"])
              .fetch(id)
            expect(result).toContainKey("object_id")
            expect(result.fulfillment).toContainEntry([
              "id",
              "ful_default_id_1",
            ])
          })
        })
      })
    })

    describe("is", () => {
      describe("type", () => {
        describe("replace", () => {
          it("returns false", async () => {
            const id = "shippo_order_default_id_1"
            const result = await shippoService
              .is(["order", id], "replace")
              .fetch()
            expect(result).toBeFalse()
          })
          // it("returns true", async () => {
          //   const id = "shippo_order_09876543210"
          //   const result = await shippoService
          //     .is(["order", id], "replace")
          //     .fetch()
          //   expect(result).toBeTrue()
          // })
        })
      })
    })
  })
})
