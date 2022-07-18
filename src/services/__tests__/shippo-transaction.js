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
    list: jest.fn(async ({ display_id }, { }) => {
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

  const newTransactionService = () => new ShippoTransactionService(
    { orderService, shippoClientService },
    {}
  )

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

    // it("returns order when arg is transaction id", async () => {
    //   const service = newTransactionService()
    //   const result = await service.findOrder("object_id_5555")
    //   expect(result).toContainEntry(["display_id", "123"])
    // })

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

    // it("returns a fulfillment when arg is transaction id", async () => {
    //   const service = newTransactionService()
    //   const result = await service.findFulfillment(
    //     "object_id_5555"
    //   )
    //   expect(result).toContainEntry(["id", "ful_321"])
    // })
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

    // it("returned expanded transaction when arg is transaction id", async () => {
    //   const service = newTransactionService()
    //   const transaction = mockTransaction("object_id_5555")
    //   const result = await service.fetchExtended(
    //     "object_id_5555"
    //   )
    //   expect(result).toContainEntry(["object_id", "object_id_5555"])
    // })
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

  // describe("setTransaction", () => {
  //   beforeAll(async () => {
  //     jest.clearAllMocks()
  //   })

  //   describe("transactionOrId is simple obj", () => {

  //     const transactionOrId = {
  //       object_id: "obj_123",
  //       rate: "rate_123"
  //     }

  //     /*********************************************************** */
  //     describe("this.transaction is undefined", () => {
  //       // const this_transaction = undefined

  //       test("this.transaction equals transaction", async () => {
  //         const service = newTransactionService()
  //         await service.setTransaction(transactionOrId)

  //         const result = service.getTransaction()
  //         expect(result).toBe(transactionOrId)
  //       })
  //     })
  //     /*********************************************************** */


  //     /*********************************************************** */
  //     describe("this.transaction set with simple obj", () => {
  //       const this_transaction = {
  //         object_id: "obj_123",
  //         rate: "rate_123"
  //       }
  //       describe("this.transaction id same as transacton.id", () => {

  //         test("this.transaction unaltered", async () => {
  //           const service = newTransactionService()
  //           await service.setTransaction(this_transaction)
  //           await service.setTransaction(transactionOrId)

  //           const result = service.getTransaction()
  //           expect(result).toStrictEqual(this_transaction)
  //         })

  //       })

  //       describe("this.transaction id different than transacton.id", () => {
  //         test("this.transaction equals transaction", async () => {
  //           const service = newTransactionService()
  //           this_transaction.object_id = "different"
  //           await service.setTransaction(this_transaction)
  //           await service.setTransaction(transactionOrId)

  //           const result = service.getTransaction()
  //           expect(result).toStrictEqual(transactionOrId)
  //         })

  //       })
  //     })
  //     /*********************************************************** */


  //     /*********************************************************** */
  //     describe("this.transaction set with extended obj", () => {
  //       const this_transaction = {
  //         object_id: "obj_123",
  //         rate: {
  //           object_id: "rateid_123"
  //         }
  //       }

  //       describe("this.transaction id same as transacton.id", () => {
  //         const transactionOrId = {
  //           object_id: "obj_123",
  //           rate: "rate_123"
  //         }

  //         test("this.transaction unaltered", async () => {
  //           const service = newTransactionService()
  //           await service.setTransaction(this_transaction)
  //           await service.setTransaction(transactionOrId)

  //           const result = service.getTransaction()
  //           expect(result).toStrictEqual(this_transaction)
  //         })
  //       })

  //       describe("this.transaction id not same as transacton.id", () => {
  //         const transactionOrId = {
  //           object_id: "obj_133",
  //           rate: "rate_123"
  //         }

  //         test("this.transaction equals transaction", async () => {
  //           const service = newTransactionService()
  //           this_transaction.object_id = "different"
  //           await service.setTransaction(this_transaction)
  //           await service.setTransaction(transactionOrId)

  //           const result = service.getTransaction()
  //           expect(result).toStrictEqual(transactionOrId)
  //         })
  //       })
  //     })
  //     /*********************************************************** */
  //   })

  //   describe("transactionOrId is extended obj", () => {
  //     const transactionOrId = {
  //       object_id: "obj_123",
  //       rate: {
  //         object_id: "rate_id123"
  //       }
  //     }

  //     /*********************************************************** */
  //     describe("this.transaction is simple obj", () => {
  //       const this_transaction = {
  //         object_id: "obj_123",
  //         rate: "rateid_123"
  //       }
  //       describe("this.transaction id same as transacton.id", () => {

  //         test("this.transaction equals transaction", async () => {
  //           const service = newTransactionService()
  //           await service.setTransaction(this_transaction)
  //           await service.setTransaction(transactionOrId)

  //           const result = service.getTransaction()
  //           expect(result).toStrictEqual(transactionOrId)
  //         })
  //       })

  //       describe("this.transaction id not same as transacton.id", () => {
  //         test("this.transaction equals transaction", async () => {
  //           const service = newTransactionService()
  //           this_transaction.object_id = "different"
  //           await service.setTransaction(this_transaction)
  //           await service.setTransaction(transactionOrId)

  //           const result = service.getTransaction()
  //           expect(result).toStrictEqual(transactionOrId)
  //         })
  //       })
  //     })
  //     /*********************************************************** */

  //     /*********************************************************** */
  //     describe("this.transaction is extended obj", () => {
  //       const this_transaction = {
  //         object_id: "obj_123",
  //         rate: {
  //           object_id: "rateid_123"
  //         }
  //       }

  //       describe("this.transaction id same as transacton.id", () => {
  //         test("this.transaction unaltered", async () => {
  //           const service = newTransactionService()
  //           await service.setTransaction(this_transaction)
  //           await service.setTransaction(transactionOrId)

  //           const result = service.getTransaction()
  //           expect(result).toStrictEqual(this_transaction)
  //         })
  //       })

  //       describe("this.transaction id not same as transacton.id", () => {
  //         test("this.transaction equals transaction", async () => {
  //           const service = newTransactionService()
  //           this_transaction.object_id = "different"
  //           await service.setTransaction(this_transaction)
  //           await service.setTransaction(transactionOrId)

  //           const result = service.getTransaction()
  //           expect(result).toStrictEqual(transactionOrId)
  //         })
  //       })
  //     })
  //     /*********************************************************** */
  //   })

  //   describe("transactionOrId is id", () => {
  //     const transactionOrId = "object_id_5555"

  //     describe("this.transaction is extended obj", () => {
  //       const this_transaction = {
  //         object_id: "object_id_5555",
  //         rate: {
  //           object_id: "rateid_123"
  //         }
  //       }

  //       describe("this.transaction id same as transacton.id", () => {
  //         test("this.transaction unaltered", async () => {
  //           const service = newTransactionService()
  //           await service.setTransaction(this_transaction)
  //           await service.setTransaction(transactionOrId)

  //           const result = service.getTransaction()
  //           expect(result).toStrictEqual(this_transaction)
  //         })
  //       })

  //       describe("this.transaction id not same as transacton.id", () => {
  //         test("this.transaction unaltered", async () => {
  //           const service = newTransactionService()
  //           this_transaction.object_id = "different"
  //           await service.setTransaction(this_transaction)
  //           await service.setTransaction(transactionOrId)

  //           const result = await service.getTransaction()
  //           expect(result).toContainEntry(["object_id", "object_id_5555"])
  //         })
  //       })
  //     })

  //     describe("this.transaction is simple obj", () => {
  //       const this_transaction = {
  //         object_id: "object_id_5555",
  //         rate: "rateid_123"
  //       }

  //       describe("this.transaction id same as transacton.id", () => {
  //         test("this.transaction unaltered", async () => {
  //           const service = newTransactionService()
  //           await service.setTransaction(this_transaction)
  //           await service.setTransaction(transactionOrId)

  //           const result = service.getTransaction()
  //           expect(result).toStrictEqual(this_transaction)
  //         })
  //       })

  //       describe("this.transaction id not same as transacton.id", () => {
  //         test("this.transaction unaltered", async () => {
  //           const service = newTransactionService()
  //           this_transaction.object_id = "different"
  //           await service.setTransaction(this_transaction)
  //           await service.setTransaction(transactionOrId)

  //           const result = service.getTransaction()
  //           expect(result).toContainEntry(["object_id", "object_id_5555"])
  //         })
  //       })
  //     })
  //   })
  // })
})
