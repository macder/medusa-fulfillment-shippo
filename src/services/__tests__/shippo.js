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
    getLineItemTotals: jest.fn(async () => mockLineItemTotals()),
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
      const fulfills = {
        321: {
          id: "ful_321",
          order_id: "123",
          data: {
            shippo_order_id: "object_id_order_123",
          },
          tracking_links: [
            {
              tracking_number: "track_num_1",
            },
          ],
        },
        4321: {
          id: "ful_4321",
          order_id: "123",
          data: {
            shippo_order_id: "object_id_order_1234",
          },
          tracking_links: [
            {
              tracking_number: "track_num_2",
            },
          ],
        },
        claim_ful: {
          id: "ful_321_claim",
          order_id: null,
          claim_order_id: "claim_123",
          data: {
            shippo_order_id: "object_id_order_replace_123",
          },
          tracking_links: [
            {
              tracking_number: "track_num_1",
            },
          ],
        },
        swap_ful: {
          id: "ful_321_swap",
          order_id: null,
          claim_order_id: null,
          swap_id: "swap_123",
          data: {
            shippo_order_id: "object_id_order_swap_123",
          },
          tracking_links: [
            {
              tracking_number: "track_num_1",
            },
          ],
        },
      }

      const fulfillments = {
        shippo_order_id: {
          object_id_order_123: [fulfills[321]],
          object_id_order_1234: [fulfills[4321]],
        },
        order_id: {
          123: [fulfills[321], fulfills[4321]],
        },
        claim_order_id: {
          claim_123: [fulfills.claim_ful],
        },
        swap_id: {
          swap_123: [fulfills.swap_ful],
        },
      }

      if (config.where?.data?.shippo_order_id) {
        const {
          where: {
            data: { shippo_order_id },
          },
        } = config
        return fulfillments.shippo_order_id[shippo_order_id]
      }
      if (config.where?.order_id) {
        const {
          where: { order_id },
        } = config
        return fulfillments.order_id[order_id]
      }
      if (config.where?.claim_order_id) {
        const {
          where: { claim_order_id },
        } = config
        return fulfillments.claim_order_id[claim_order_id]
      }
      if (config.where?.swap_id) {
        const {
          where: { swap_id },
        } = config
        return fulfillments.swap_id[swap_id]
      }
    },
  })

  const getShippingProfileService = (cartOptions) => ({
    fetchCartOptions: jest.fn(async () => cartOptions),
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
    retrieve: jest.fn(
      async (id) =>
        ({
          ful_321: {
            id,
            order_id: "123",
            data: {
              shippo_order_id: "object_id_order_123",
            },
            tracking_links: [
              {
                tracking_number: "track_num_1",
              },
            ],
          },
          ful_4321: {
            id,
            order_id: "123",
            claim_order_id: null,
            swap_id: null,
            data: {
              shippo_order_id: "object_id_order_1234",
            },
            tracking_links: [
              {
                tracking_number: "track_num_1",
              },
            ],
          },
          ful_321_claim: {
            id,
            order_id: null,
            claim_order_id: "claim_123",
            swap_id: null,
            data: {
              shippo_order_id: "object_id_order_replace_123",
            },
            tracking_links: [
              {
                tracking_number: "track_num_1",
              },
            ],
          },
          ful_321_swap: {
            id,
            order_id: null,
            claim_order_id: null,
            swap_id: "swap_123",
            data: {
              shippo_order_id: "object_id_order_swap_123",
            },
            tracking_links: [
              {
                tracking_number: "track_num_1",
              },
            ],
          },
        }[id])
    ),
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
            data: {
              shippo_order_id: "object_id_order_1234",
            },
          },
        ],
        claims: [
          {
            id: "claim_123",
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
            id: "swap_123",
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
        display_id: "321 (replace)",
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

      describe("local_order", () => {
        test("returns", async () => {
          const id = 123
          const result = await shippoService.order.fetchBy(["local_order", id])
          expect(result[0]).toContainEntry(["object_id", "object_id_order_123"])
          expect(result[1]).toContainEntry([
            "object_id",
            "object_id_order_1234",
          ])
        })
      })

      describe("claim", () => {
        test("returns", async () => {
          const id = "claim_123"
          const result = await shippoService.order.fetchBy(["claim", id])
          expect(result[0]).toContainEntry([
            "object_id",
            "object_id_order_replace_123",
          ])
        })
      })

      describe("swap", () => {
        test("returns", async () => {
          const id = "swap_123"
          const result = await shippoService.order.fetchBy(["swap", id])
          expect(result[0]).toContainEntry([
            "object_id",
            "object_id_order_swap_123",
          ])
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

    describe("is", () => {
      describe("type", () => {
        describe("replace", () => {
          it("returns false", async () => {
            const id = "object_id_order_123"
            const result = await shippoService
              .is(["order", id], "replace")
              .fetch()
            expect(result).toBeFalse()
          })
          it("returns true", async () => {
            const id = "object_id_order_replace_123"
            const result = await shippoService
              .is(["order", id], "replace")
              .fetch()
            expect(result).toBeTrue()
          })
        })
      })
    })
  })
  /* ===================================================== */

  /* ===================================================== */
  describe("package", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns packer output", async () => {
      const lineItems = makeArrayOf(mockLineItem, 2)
      const result = await shippoService.package
        .for(["items", lineItems])
        .fetch()
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

    describe("fetch", () => {
      test("returns packing slip", async () => {
        const id = "object_id_order_123"
        const result = await shippoService.packingslip.fetch(id)
        expect(result).toContainKey("slip_url")
      })
    })

    describe("fetchBy", () => {
      describe("fulfillment", () => {
        test("returns packing slip", async () => {
          const id = "ful_321"
          const result = await shippoService.packingslip.fetchBy([
            "fulfillment",
            id,
          ])
          expect(result).toContainKey("slip_url")
        })
      })

      describe("local_order", () => {
        test("returns packing slip", async () => {
          const id = "123"
          const result = await shippoService.packingslip.fetchBy([
            "local_order",
            id,
          ])
          expect(result[0]).toContainEntries([
            ["fulfillment_id", "ful_321"],
            ["shippo_order_id", "object_id_order_123"],
            ["slip_url", "https://console.log"],
          ])
        })
      })

      describe("claim", () => {
        test("returns packing slip", async () => {
          const id = "claim_123"
          const result = await shippoService.packingslip.fetchBy(["claim", id])
          expect(result[0]).toContainEntries([
            ["fulfillment_id", "ful_321_claim"],
            ["shippo_order_id", "object_id_order_replace_123"],
            ["slip_url", "https://console.log"],
          ])
        })
      })

      describe("swap", () => {
        test("returns packing slip", async () => {
          const id = "swap_123"
          const result = await shippoService.packingslip.fetchBy(["swap", id])
          expect(result[0]).toContainEntries([
            ["fulfillment_id", "ful_321_swap"],
            ["shippo_order_id", "object_id_order_swap_123"],
            ["slip_url", "https://console.log"],
          ])
        })
      })
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
    describe("for", () => {
      describe("cart", () => {
        describe("fetch", () => {
          test("returns rate with parcel id", async () => {
            const id = "cart_id_is_ready"
            const result = await shippoService.rates.for(["cart", id]).fetch()
            expect(result).toBeArray()
            expect(result[0]).toContainKey("parcel")
          })
        })
      })
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
      describe("fulfillment", () => {
        describe("variant: default", () => {
          test("returns transaction", async () => {
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
        })

        describe("variant: extended", () => {
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
        })
      })

      describe("local_order", () => {
        describe("variant: default", () => {
          test("returns transaction", async () => {
            const result = await shippoService.transaction.fetchBy([
              "local_order",
              "123",
            ])

            expect(result[0]).toContainEntry([
              "object_id",
              "object_id_transaction_123",
            ])
            expect(result[0]).toContainEntry(["rate", ""])
          })
        })

        describe("variant: extended", () => {
          test("returns transaction", async () => {
            const result = await shippoService.transaction.fetchBy(
              ["local_order", "123"],
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
      })
    })

    describe("is", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      describe("return", () => {
        test("is false", async () => {
          const id = "object_id_transaction_123"
          const result = await shippoService
            .is(["transaction", id], "return")
            .fetch()
          expect(result).toBeFalse()
        })

        test("is true", async () => {
          const id = "object_id_return"
          const result = await shippoService
            .is(["transaction", id], "return")
            .fetch()
          expect(result).toBeTrue()
        })
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
