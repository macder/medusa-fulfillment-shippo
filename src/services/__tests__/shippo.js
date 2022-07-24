import { MockManager, MockRepository } from "medusa-test-utils"

import * as matchers from "jest-extended"
import ShippoService from "../shippo"
import ShippoClientService from "../shippo-client"
import ShippoOrderService from "../shippo-order"
import ShippoPackerService from "../shippo-packer"
import ShippoRatesService from "../shippo-rates"
import ShippoTrackService from "../shippo-track"
import ShippoTransactionService from "../shippo-transaction"

import {
  makeArrayOf,
  mockLineItem,
  // mockParcelTemplate,
  mockCart,
  mockLineItemTotals,
  mockShippingOption,
} from "../__mocks__/data"

expect.extend(matchers)

describe("shippoService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const totalsService = {
    getLineItemTotals: jest.fn(async (item, order) => mockLineItemTotals()),
  }

  const pricingService = {
    setShippingOptionPrices: jest.fn(async (options) => options),
  }

  const cartService = {
    retrieve: jest.fn(async (id) => {
      const carts = {
        cart_id_is_ready: mockCart({ hasAddress: true, hasItems: 1 }),
      }
      return carts[id]
    }),
  }

  const fulfillmentRepository = MockRepository({
    find: async (config) => {
      const fulfillments = {
        object_id_order_123: [
          {
            data: {
              shippo_order_id: "object_id_order_123",
            },
            tracking_links: [
              {
                tracking_number: "track_num_1",
              },
            ],
          },
        ],
      }
      const {
        where: {
          data: { shippo_order_id },
        },
      } = config
      return fulfillments[shippo_order_id]
    },
  })

  const getShippingProfileService = (cartOptions) => ({
    fetchCartOptions: jest.fn(async (cart) => cartOptions),
  })

  const mockCartShippingOptions = () => {
    const soCalculated = [mockShippingOption({ variant: "live_rate" })]
    const soFlatRate = [mockShippingOption({ variant: "default" })]
    soCalculated[0].data.name = "testing 123"
    soCalculated[0].data.object_id = "object_id"
    soCalculated[0].id = "so_id"
    return soCalculated.concat(soFlatRate)
  }

  const shippingProfileService = getShippingProfileService(
    mockCartShippingOptions()
  )

  const fulfillmentService = {
    retrieve: jest.fn(async (id) => ({
      id,
      data: {
        shippo_order_id: "object_id_order_123",
      },
      tracking_links: [
        {
          tracking_number: "track_num_1",
        },
      ],
    })),
  }

  const mockOrder = {
    123: [
      {
        id: "order_321",
        display_id: "123",
        fulfillments: [
          {
            id: "ful_321",
            data: {
              shippo_order_id: "object_id_order_123",
            },
          },
          {
            id: "ful_4321",
            data: {},
          },
        ],
        claims: [
          {
            fulfillments: [
              {
                id: "ful_321_claim",
                data: {
                  shippo_order_id: "object_id_order_replace_123",
                },
              },
            ],
          },
        ],
        swaps: [
          {
            fulfillments: [
              {
                id: "ful_321_swap",
                data: {
                  shippo_order_id: "object_id_order_swap_123",
                },
              },
            ],
          },
        ],
      },
    ],
    321: [
      {
        id: "order_321",
        display_id: "321",
      },
    ],
  }

  const orderService = {
    list: jest.fn(async ({ display_id }, {}) => mockOrder[display_id]),
    retrieve: jest.fn(async (id) => mockOrder[id][0]),
  }

  const shippoClientService = new ShippoClientService(
    { fulfillmentService },
    {}
  )

  const shippoPackerService = new ShippoPackerService(
    { shippoClientService },
    {}
  )

  const shippoRatesService = new ShippoRatesService(
    {
      cartService,
      pricingService,
      shippingProfileService,
      shippoClientService,
      shippoPackerService,
      totalsService,
    },
    {}
  )

  const shippoTransactionService = new ShippoTransactionService(
    {
      fulfillmentService,
      shippoClientService,
      orderService,
    },
    {}
  )

  const shippoOrderService = new ShippoOrderService(
    {
      manager: MockManager,
      fulfillmentService,
      fulfillmentRepository,
      shippoClientService,
      shippoTransactionService,
    },
    {}
  )

  const shippoTrackService = new ShippoTrackService(
    {
      fulfillmentService,
      shippoClientService,
      shippoOrderService,
      shippoTransactionService,
    },
    {}
  )

  const shippoService = new ShippoService(
    {
      shippoClientService,
      shippoOrderService,
      shippoPackerService,
      shippoRatesService,
      shippoTrackService,
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

    describe("fetch", () => {
      describe("id", () => {
        test("returns", async () => {
          const id = "object_id_order_123"
          const result = await shippoService.order.fetch(id)
          expect(result).toContainEntry(["object_id", id])
        })
      })
    })

    describe("fetchBy", () => {
      describe("fulfillment", () => {
        test("returns", async () => {
          const id = "ful_321"
          const result = await shippoService.order.fetchBy(["fulfillment", id])
          expect(result).toContainKey("object_id")
        })
      })
    })

    describe("with", () => {
      describe("fulfillment", () => {
        describe("fetch", () => {
          test("returns correct order", async () => {
            const id = "object_id_order_123"
            const result = await shippoService.order
              .with(["fulfillment"])
              .fetch(id)
            expect(result).toContainEntry(["object_id", id])
          })

          test("returns with prop.fulfillment", async () => {
            const id = "object_id_order_123"
            const result = await shippoService.order
              .with(["fulfillment"])
              .fetch(id)
            expect(result).toContainKey("fulfillment")
          })

          test("returns with fulfillment", async () => {
            const id = "object_id_order_123"
            const result = await shippoService.order
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

    describe("with", () => {
      describe("fulfillment", () => {
        describe("fetch", () => {
          test("returns packing slip", async () => {
            const id = "object_id_order_123"
            const result = await shippoService.packingslip
              .with(["fulfillment"])
              .fetch(id)
            expect(result).toContainKey("slip_url")
          })

          test("returns prop.fulfillment", async () => {
            const id = "object_id_order_123"
            const result = await shippoService.packingslip
              .with(["fulfillment"])
              .fetch(id)
            expect(result).toContainKey("fulfillment")
          })

          test("returns with fulfillment", async () => {
            const id = "object_id_order_123"
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
  /* ===================================================== */

  /* ===================================================== */
  describe("rates", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    test("cart(id) returns array of live-rates with parcel id", async () => {
      const result = await shippoService.rates.cart("cart_id_is_ready")
      expect(result).toBeArray()
      expect(result[0]).toContainKey("parcel")
    })

    test("cart(id, so_id) returns single live-rate object with parcel id", async () => {
      const result = await shippoService.rates.cart("cart_id_is_ready", "so_id")
      expect(result).toBeObject()
      expect(result).toContainKey("parcel")
    })
  })
  /* ===================================================== */

  /* ===================================================== */
  describe("track", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    test("fetch returns requested track", async () => {
      const result = await shippoService.track.fetch("usps", "track_num_1")
      expect(result).toContainEntries([
        ["tracking_number", "track_num_1"],
        ["carrier", "usps"],
      ])
    })

    test("fetchBy ful_id returns requested track", async () => {
      const result = await shippoService.track.fetchBy([
        "fulfillment",
        "ful_321",
      ])

      expect(result).toContainEntries([
        ["tracking_number", "track_num_1"],
        ["carrier", "usps"],
      ])
    })
  })
  /* ===================================================== */

  /* ===================================================== */
  describe("transaction", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    describe("fetch", () => {
      it("returns requested default transaction", async () => {
        const result = await shippoService.transaction.fetch(
          "object_id_transaction_123"
        )
        expect(result).toContainEntry([
          "object_id",
          "object_id_transaction_123",
        ])
        expect(result).toContainEntry(["rate", ""])
      })

      it("returns requested extended transaction", async () => {
        const result = await shippoService.transaction.fetch(
          "object_id_transaction_123",
          {
            variant: "extended",
          }
        )
        expect(result).toContainEntry([
          "object_id",
          "object_id_transaction_123",
        ])
        expect(result.rate).toContainEntry([
          "carrier_account",
          "carrier_id_123",
        ])
      })
    })

    describe("fetchBy", () => {
      test("fulfillment returns requested default transaction", async () => {
        const result = await shippoService.transaction.fetchBy([
          "fulfillment",
          "ful_321",
        ])

        expect(result[0]).toContainEntry([
          "object_id",
          "object_id_transaction_123",
        ])
        expect(result[0]).toContainEntry(["rate", ""])
      })

      test("fulfillment returns requested extended transaction", async () => {
        const result = await shippoService.transaction.fetchBy(
          ["fulfillment", "ful_321"],
          { variant: "extended" }
        )

        expect(result[0]).toContainEntry([
          "object_id",
          "object_id_transaction_123",
        ])
        expect(result[0].rate).toContainEntry([
          "carrier_account",
          "carrier_id_123",
        ])
      })

      test("order returns requested default transaction", async () => {
        const result = await shippoService.transaction.fetchBy(["order", "123"])

        expect(result[0]).toContainEntry([
          "object_id",
          "object_id_transaction_123",
        ])
        expect(result[0]).toContainEntry(["rate", ""])
      })

      test("order returns requested extended transaction", async () => {
        const result = await shippoService.transaction.fetchBy(
          ["order", "123"],
          {
            variant: "extended",
          }
        )

        expect(result[0]).toContainEntry([
          "object_id",
          "object_id_transaction_123",
        ])
        expect(result[0].rate).toContainEntry([
          "carrier_account",
          "carrier_id_123",
        ])
      })
    })

    describe("isReturn", () => {
      test("is false", async () => {
        const id = "object_id_transaction_123"
        const result = await shippoService.transaction.isReturn(id)
        expect(result).toBeFalse()
      })

      test("is true", async () => {
        const id = "object_id_return"
        const result = await shippoService.transaction.isReturn(id)
        expect(result).toBeTrue()
      })
    })
  })
  /* ===================================================== */

  /* ===================================================== */
  describe("find", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    describe("fulfillment", () => {
      describe("for", () => {
        describe("transaction", () => {
          it("finds order.fulfillment", async () => {
            const id = "object_id_transaction_123"
            const result = await shippoService
              .find("fulfillment")
              .for(["transaction", id])

            expect(result).toContainEntry(["id", "ful_321"])
          })

          it("finds order.claim.fulfillment", async () => {
            const id = "object_id_transaction_replace_123"
            const result = await shippoService
              .find("fulfillment")
              .for(["transaction", id])

            expect(result).toContainEntry(["id", "ful_321_claim"])
            expect(result.data).toContainEntry([
              "shippo_order_id",
              "object_id_order_replace_123",
            ])
          })

          it("finds order.swap.fulfillment", async () => {
            const id = "object_id_transaction_swap_123"
            const result = await shippoService
              .find("fulfillment")
              .for(["transaction", id])

            expect(result).toContainEntry(["id", "ful_321_swap"])
            expect(result.data).toContainEntry([
              "shippo_order_id",
              "object_id_order_swap_123",
            ])
          })
        })
      })
    })

    describe("fulfillment", () => {
      describe("for", () => {
        describe("order", () => {
          it("finds order that has the transaction", async () => {
            const id = "object_id_transaction_123"
            const result = await shippoService
              .find("order")
              .for(["transaction", id])
            expect(result).toContainEntry(["id", "order_321"])
          })

          it("finds order that has transaction for claim.replace", async () => {
            const id = "object_id_transaction_replace_123"
            const result = await shippoService
              .find("order")
              .for(["transaction", id])
            expect(result).toContainEntry(["id", "order_321"])
          })

          it("finds order that has transaction for swap.replace", async () => {
            const id = "object_id_transaction_swap_123"
            const result = await shippoService
              .find("order")
              .for(["transaction", id])
            expect(result).toContainEntry(["id", "order_321"])
          })
        })
      })
    })
  })
  /* ===================================================== */
})
