import * as matchers from "jest-extended"
import { buildShippoServices } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { defaults as defaultProps, propWorker } from "../../__mocks__/props"

expect.extend(matchers)

const mockShippoClient = shippoClientMock(defaultProps)

jest.mock("shippo", () => () => mockShippoClient)

describe("transaction", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const { shippoService } = buildShippoServices(defaultProps)

  describe("fetch", () => {
    it("returns requested default transaction", async () => {
      const result = await shippoService.transaction.fetch(
        "transaction_01234567890"
      )
      expect(result).toContainEntry(["object_id", "transaction_01234567890"])
      expect(result).toContainEntry(["rate", ""])
    })

    it("returns requested extended transaction", async () => {
      const result = await shippoService.transaction.fetch(
        "transaction_01234567890",
        {
          variant: "extended",
        }
      )

      expect(result).toContainEntry(["object_id", "transaction_01234567890"])
      expect(result.rate).toContainEntry(["carrier_account", "carrier_id_here"])
    })
  })

  describe("fetchBy", () => {
    const { shippoService } = buildShippoServices(defaultProps)

    describe("fulfillment", () => {
      describe("variant: default", () => {
        test("returns transaction", async () => {
          const result = await shippoService.transaction.fetchBy([
            "fulfillment",
            "ful_01234567890",
          ])

          expect(result[0]).toContainEntry([
            "object_id",
            "transaction_01234567890",
          ])

          expect(result[1]).toContainEntry([
            "object_id",
            "transaction_01234567890_return",
          ])
          expect(result[0]).toContainEntry(["rate", ""])
          expect(result[1]).toContainEntry(["rate", ""])
        })
      })

      describe("variant: extended", () => {
        test("fulfillment returns requested extended transaction", async () => {
          const result = await shippoService.transaction.fetchBy(
            ["fulfillment", "ful_01234567890"],
            { variant: "extended" }
          )
          expect(result[0]).toContainEntry([
            "object_id",
            "transaction_01234567890",
          ])
          expect(result[1]).toContainEntry([
            "object_id",
            "transaction_01234567890_return",
          ])
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
            "order_01234567890",
          ])

          expect(result[0]).toContainEntry([
            "object_id",
            "transaction_01234567890",
          ])

          expect(result[1]).toContainEntry([
            "object_id",
            "transaction_01234567890_return",
          ])
          expect(result[2]).toContainEntry([
            "object_id",
            "transaction_09876543210",
          ])

          expect(result[3]).toContainEntry([
            "object_id",
            "transaction_09876543210_return",
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
            ["local_order", "order_01234567890"],
            {
              variant: "extended",
            }
          )
          expect(result[0]).toContainEntry([
            "object_id",
            "transaction_01234567890",
          ])
          expect(result[0].rate).toContainEntry([
            "carrier_account",
            "carrier_id_here",
          ])
          expect(result[3]).toContainEntry([
            "object_id",
            "transaction_09876543210_return",
          ])
          expect(result[3].rate).toContainEntry([
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
        const id = "transaction_01234567890"
        const result = await shippoService
          .is(["transaction", id], "return")
          .fetch()
        expect(result).toBeFalse()
      })
      test("is true", async () => {
        const id = "transaction_01234567890_return"
        const result = await shippoService
          .is(["transaction", id], "return")
          .fetch()
        expect(result).toBeTrue()
      })
    })
  })
})
