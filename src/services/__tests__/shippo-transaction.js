import * as matchers from "jest-extended"
import ShippoClientService from "../shippo-client"
import ShippoTransactionService from "../shippo-transaction"

import { mockTransaction } from "../__mocks__/data"

expect.extend(matchers)

describe("shippoTransactionService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const orderService = {
    list: jest.fn(async ({ display_id }, {}) => {
      const orders = {
        123: [
          {
            id: "order_321",
            display_id: "123",
            fulfillments: [
              {
                id: "ful_321",
                data: {
                  shippo_order_id: "object_id_112233",
                },
              },
              {
                id: "ful_4321",
                data: {},
              },
            ],
          },
        ],
      }
      return orders[display_id]
    }),
  }

  const shippoClientService = new ShippoClientService({}, {})

  const newTransactionService = () =>
    new ShippoTransactionService({ orderService, shippoClientService }, {})

  describe("findOrder", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns order when arg is transaction object", async () => {
      const service = newTransactionService()
      const transaction = mockTransaction("object_id_5555")
      const result = await service.findOrder(transaction)
      expect(result).toContainEntry(["display_id", "123"])
    })

    it("returns false when order not found", async () => {
      const service = newTransactionService()
      const transaction = mockTransaction("object_id_3210")
      const result = await service.findOrder(transaction)
      expect(result).toBe(false)
    })
  })

  describe("findFulfillment", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns a fulfillment when arg is transaction object", async () => {
      const service = newTransactionService()
      const transaction = mockTransaction("object_id_5555")
      const result = await service.findFulfillment(transaction)
      expect(result).toContainEntry(["id", "ful_321"])
    })
  })

  describe("fetchExtended", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returned expanded transaction when arg is transaction obj", async () => {
      const service = newTransactionService()
      const transaction = mockTransaction("object_id_5555")
      const result = await service.fetchExtended(transaction)
      expect(result).toContainEntry(["object_id", "object_id_5555"])
    })
  })

  describe("fetch", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns a transaction", async () => {
      const service = newTransactionService()
      const result = await service.fetch("object_id_5555")
      expect(result).toContainEntry(["object_id", "object_id_5555"])
    })
  })
})
