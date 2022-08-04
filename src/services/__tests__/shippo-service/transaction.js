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

  describe("fetch", () => {
    const { shippoService } = buildShippoServices(defaultProps)

    it("returns requested default transaction", async () => {
      const result = await shippoService.transaction.fetch(
        "transaction_01234567890"
      )
      expect(result).toContainEntry([
        "object_id",
        "transaction_01234567890",
      ])
      expect(result).toContainEntry(["rate", ""])
    })

    // it("returns requested extended transaction", async () => {
    //   const result = await shippoService.transaction.fetch(
    //     "object_id_transaction_123",
    //     {
    //       variant: "extended",
    //     }
    //   )
    //   expect(result).toContainEntry([
    //     "object_id",
    //     "object_id_transaction_123",
    //   ])
    //   expect(result.rate).toContainEntry([
    //     "carrier_account",
    //     "carrier_id_123",
    //   ])
    // })
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
        // test("fulfillment returns requested extended transaction", async () => {
        //   const result = await shippoService.transaction.fetchBy(
        //     ["fulfillment", "ful_321"],
        //     { variant: "extended" }
        //   )

        //   expect(result[0]).toContainEntry([
        //     "object_id",
        //     "object_id_transaction_123",
        //   ])
        //   expect(result[0].rate).toContainEntry([
        //     "carrier_account",
        //     "carrier_id_123",
        //   ])
        // })
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
        // test("returns transaction", async () => {
        //   const result = await shippoService.transaction.fetchBy(
        //     ["local_order", "123"],
        //     {
        //       variant: "extended",
        //     }
        //   )

        //   expect(result[0]).toContainEntry([
        //     "object_id",
        //     "object_id_transaction_123",
        //   ])
        //   expect(result[0].rate).toContainEntry([
        //     "carrier_account",
        //     "carrier_id_123",
        //   ])
        // })
      })
    })
  })

  describe("is", () => {
    // beforeAll(async () => {
    //   jest.clearAllMocks()
    // })

    describe("return", () => {
      // test("is false", async () => {
      //   const id = "object_id_transaction_123"
      //   const result = await shippoService
      //     .is(["transaction", id], "return")
      //     .fetch()
      //   expect(result).toBeFalse()
      // })

      // test("is true", async () => {
      //   const id = "object_id_return"
      //   const result = await shippoService
      //     .is(["transaction", id], "return")
      //     .fetch()
      //   expect(result).toBeTrue()
      // })
    })
  })

})