import * as matchers from "jest-extended"
import ShippoService from "../shippo"
import ShippoClientService from "../shippo-client"
import ShippoOrderService from "../shippo-order"
import ShippoPackerService from "../shippo-packer"
import ShippoRatesService from "../shippo-rates"
import ShippoTransactionService from "../shippo-transaction"

import {
  makeArrayOf,
  mockLineItem,
  // mockParcelTemplate,
} from "../__mocks__/data"

expect.extend(matchers)

describe("shippoService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const fulfillmentService = {
    retrieve: jest.fn(async (id) => ({
      id,
      data: {
        shippo_order_id: "object_id_112233",
      },
    })),
  }

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

  const shippoClientService = new ShippoClientService(
    { fulfillmentService },
    {}
  )

  const shippoOrderService = new ShippoOrderService(
    {
      fulfillmentService,
      shippoClientService,
      shippoTransactionService,
    },
    {}
  )

  const shippoPackerService = new ShippoPackerService(
    { shippoClientService },
    {}
  )

  const shippoTransactionService = new ShippoTransactionService(
    {
      shippoClientService,
      orderService,
    },
    {}
  )

  const shippoService = new ShippoService(
    {
      shippoClientService,
      shippoOrderService,
      shippoPackerService,
      shippoTransactionService,
    },
    {}
  )

  /* ===================================================== */
  describe("account", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns address object", async () => {
      // const shippoService = newShippoService()

      const result = await shippoService.account.address()
      expect(result).toContainKeys([
        "name",
        "company",
        "street1",
        "street2",
        "street_no",
        "city",
        "state",
        "zip",
        "country",
        "phone",
        "email",
      ])
    })
  })
  /* ===================================================== */

  /* ===================================================== */
  describe("order", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    test("fetch returns order by id", async () => {
      const id = "123"
      const result = await shippoService.order.fetch(id)
      expect(result).toContainEntry(["object_id", id])
    })

    test("fetchBy fulfillment returns order", async () => {
      const id = "ful_321"
      const result = await shippoService.order.fetchBy(["fulfillment", id])
      expect(result).toContainKey("object_id")
    })
  })
  /* ===================================================== */

  /* ===================================================== */
  describe("packer", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns packer output", async () => {
      const lineItems = makeArrayOf(mockLineItem, 2)
      const result = await shippoService.packer.pack(lineItems)

      expect(result).toBeArray()
      expect(result[0]).toContainKey("packer_output")
    })
  })
  /* ===================================================== */

  /* ===================================================== */
  describe("packingslip", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    test("fetch returns packing slip", async () => {
      const result = await shippoService.packingslip.fetch("89")
      expect(result).toContainKey("slip_url")
    })

    test("fetchBy returns packing slip", async () => {
      const result = await shippoService.packingslip.fetchBy([
        "fulfillment",
        "98",
      ])
      expect(result).toContainKey("slip_url")
    })
  })
  /* ===================================================== */

  /* ===================================================== */
  describe("rates", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("", async () => {
      const result = ""
      // console.log('*********result: ', JSON.stringify(result, null, 2))
      // expect(result).
    })
  })
  /* ===================================================== */

  /* ===================================================== */
  describe("track", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("", async () => {
      const result = ""
      // console.log('*********result: ', JSON.stringify(result, null, 2))
      // expect(result).
    })
  })
  /* ===================================================== */

  /* ===================================================== */
  describe("transaction", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("", async () => {
      const result = ""
      // console.log('*********result: ', JSON.stringify(result, null, 2))
      // expect(result).
    })
  })
  /* ===================================================== */
})
