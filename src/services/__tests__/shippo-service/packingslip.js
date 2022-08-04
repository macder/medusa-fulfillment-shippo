import * as matchers from "jest-extended"
import { buildShippoServices } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { defaults as defaultProps, propWorker } from "../../__mocks__/props"

expect.extend(matchers)

const mockShippoClient = shippoClientMock(defaultProps)

jest.mock("shippo", () => () => mockShippoClient)

describe("packingslip", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  describe("fetch", () => {
    const { shippoService } = buildShippoServices(defaultProps)
    test("returns packing slip", async () => {
      const id = "shippo_order_01234567890"
      const result = await shippoService.packingslip.fetch(id)
      expect(result).toContainKey("slip_url")
    })
  })

  describe("fetchBy", () => {
    describe("fulfillment", () => {
      const { shippoService } = buildShippoServices(defaultProps)
      test("returns packing slip", async () => {
        const id = "ful_01234567890"
        const result = await shippoService.packingslip.fetchBy([
          "fulfillment",
          id,
        ])
        expect(result).toContainKey("slip_url")
      })
    })

    describe("local_order", () => {
      const { shippoService } = buildShippoServices(defaultProps)
      test("returns packing slip", async () => {
        const id = "order_01234567890"
        const result = await shippoService.packingslip.fetchBy([
          "local_order",
          id,
        ])
        expect(result[0]).toContainEntries([
          ["fulfillment_id", "ful_01234567890"],
          ["shippo_order_id", "shippo_order_01234567890"],
          ["slip_url", "https://shippo-delivery.net"],
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
      test("returns packing slip", async () => {
        const id = "claim_01234567890"
        const result = await shippoService.packingslip.fetchBy(["claim", id])

        expect(result[0]).toContainEntries([
          ["fulfillment_id", "ful_11"],
          ["shippo_order_id", "shippo_order_09876543210"],
          ["slip_url", "https://shippo-delivery.net"],
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
      test("returns packing slip", async () => {
        const id = "swap_01234567890"
        const result = await shippoService.packingslip.fetchBy(["swap", id])
        expect(result[0]).toContainEntries([
          ["fulfillment_id", "ful_11"],
          ["shippo_order_id", "shippo_order_01234567890"],
          ["slip_url", "https://shippo-delivery.net"],
        ])
      })
    })
  })

  describe("with", () => {
    const { shippoService } = buildShippoServices(defaultProps)
    describe("fulfillment", () => {
      describe("fetch", () => {
        test("returns packing slip", async () => {
          const id = "shippo_order_01234567890"
          const result = await shippoService.packingslip
            .with(["fulfillment"])
            .fetch(id)
          expect(result).toContainKey("slip_url")
        })

        test("returns prop.fulfillment", async () => {
          const id = "shippo_order_01234567890"
          const result = await shippoService.packingslip
            .with(["fulfillment"])
            .fetch(id)
          expect(result).toContainKey("fulfillment")
        })

        test("returns with fulfillment", async () => {
          const id = "shippo_order_01234567890"
          const result = await shippoService.packingslip
            .with(["fulfillment"])
            .fetch(id)
          expect(result.fulfillment.data).toContainEntry([
            "shippo_order_id",
            id,
          ])
        })
      })
    })
  })
})
