import * as matchers from "jest-extended"
import { buildShippoServices } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { defaults as defaultProps, propWorker } from "../../__mocks__/props"

expect.extend(matchers)

const mockShippoClient = shippoClientMock(defaultProps)

jest.mock("shippo", () => () => mockShippoClient)

describe("shippoService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  describe("order", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    describe("fetch", () => {
      const { shippoService } = buildShippoServices(defaultProps)
      describe("id", () => {
        test("returns", async () => {
          const id = "shippo_order_01234567890"
          const result = await shippoService.order.fetch(id)
          expect(result).toContainEntry(["object_id", id])
        })
      })
    })

    describe("fetchBy", () => {
      describe("fulfillment", () => {
        const { shippoService } = buildShippoServices(defaultProps)
        test("returns", async () => {
          const id = "ful_01234567890"
          const result = await shippoService.order.fetchBy(["fulfillment", id])
          expect(result).toContainEntry([
            "object_id",
            "shippo_order_01234567890",
          ])
        })
      })

      describe("local_order", () => {
        const { shippoService } = buildShippoServices(defaultProps)
        test("returns", async () => {
          const id = "order_01234567890"
          const result = await shippoService.order.fetchBy(["local_order", id])
          expect(result).toBeArray()
          expect(result[0]).toContainEntry([
            "object_id",
            "shippo_order_01234567890",
          ])
        })
      })

      describe("claim", () => {
        const claimProps = (fn) =>
          fn({
            ...defaultProps(propWorker)()
              .set("claim_id", "claim_01234567890")
              .set("order_id", null)
              .push("fulfillments", {
                id: "ful_11",
                claim_order_id: "claim_01234567890",
                shippo_order_id: "shippo_order_09876543210",
                items: [{ item_id: "item_14785236901" }],
              })
              .release(),
          })

        const { shippoService } = buildShippoServices(claimProps)

        test("returns", async () => {
          const id = "claim_01234567890"
          const result = await shippoService.order.fetchBy(["claim", id])
          expect(result).toBeArray()
          expect(result[0]).toContainEntry([
            "object_id",
            "shippo_order_09876543210",
          ])
        })
      })

      describe("swap", () => {
        const swapProps = (fn) =>
          fn({
            ...defaultProps(propWorker)()
              .set("swap_id", "swap_01234567890")
              .set("order_id", null)
              .push("fulfillments", {
                id: "ful_11",
                swap_id: "swap_01234567890",
                shippo_order_id: "shippo_order_01234567890",
                items: [{ item_id: "item_14785236901" }],
              })
              .release(),
          })

        const { shippoService } = buildShippoServices(swapProps)

        test("returns", async () => {
          const id = "swap_01234567890"
          const result = await shippoService.order.fetchBy(["swap", id])
          expect(result).toBeArray()
          expect(result[0]).toContainEntry([
            "object_id",
            "shippo_order_01234567890",
          ])
        })
      })
    })

    describe("with", () => {
      const { shippoService } = buildShippoServices(defaultProps)
      describe("fulfillment", () => {
        describe("fetch", () => {
          test("returns with correct object_id", async () => {
            const id = "shippo_order_01234567890"
            const result = await shippoService.order
              .with(["fulfillment"])
              .fetch(id)

            expect(result).toContainEntry(["object_id", id])
          })

          test("returns with prop.fulfillment", async () => {
            const id = "shippo_order_01234567890"
            const result = await shippoService.order
              .with(["fulfillment"])
              .fetch(id)
            expect(result).toContainKey("fulfillment")
          })

          test("returns with fulfillment", async () => {
            const id = "shippo_order_01234567890"
            const result = await shippoService.order
              .with(["fulfillment"])
              .fetch(id)
            expect(result.fulfillment).toContainEntry(["id", "ful_01234567890"])
          })
        })
      })
    })

    describe("is", () => {
      const { shippoService } = buildShippoServices(defaultProps)
      describe("type", () => {
        describe("replace", () => {
          it("returns false", async () => {
            const id = "shippo_order_01234567890"
            const result = await shippoService
              .is(["order", id], "replace")
              .fetch()
            expect(result).toBeFalse()
          })
          it("returns true", async () => {
            const id = "shippo_order_09876543210"
            const result = await shippoService
              .is(["order", id], "replace")
              .fetch()
            expect(result).toBeTrue()
          })
        })
      })
    })
  })
})
