import * as matchers from "jest-extended"
import { MockManager, MockRepository } from "medusa-test-utils"
import ShippoService from "../shippo"
import ShippoClientService from "../shippo-client"
import ShippoOrderService from "../shippo-order"
import ShippoPackageService from "../shippo-package"
import ShippoPackerService from "../shippo-packer"
import ShippoRatesService from "../shippo-rates"
import ShippoTrackService from "../shippo-track"
import ShippoTransactionService from "../shippo-transaction"

import {
  cartServiceMock,
  config as defaultConfig,
  fulfillmentServiceMock,
  fulfillmentRepoMock,
  lineItemServiceMock,
  orderServiceMock,
  shippingProfileServiceMock,
  totalsServiceMock,
  shippoClientMock,
} from "../__mocks__"

expect.extend(matchers)

const mockShippoClient = shippoClientMock(defaultConfig)

jest.mock("shippo", () => () => mockShippoClient)

const coreServiceMocks = (config) => (fn) =>
  fn({
    cartService: cartServiceMock(config),
    fulfillmentService: fulfillmentServiceMock(config),
    orderService: orderServiceMock(config),
    lineItemService: lineItemServiceMock(config),
    shippingProfileService: shippingProfileServiceMock(config),
    manager: MockManager,
    fulfillmentRepository: fulfillmentRepoMock(config),
    totalsService: totalsServiceMock(),
    pricingService: {
      setShippingOptionPrices: jest.fn(async (options) => options),
    },
  })

const buildShippoService = (config) => {
  const {
    cartService,
    fulfillmentService,
    orderService,
    lineItemService,
    shippingProfileService,
    fulfillmentRepository,
    manager,
    pricingService,
    totalsService,
  } = coreServiceMocks(config)((mocks) => mocks)

  const shippoClientService = new ShippoClientService(
    { fulfillmentService },
    {}
  )

  const shippoPackerService = new ShippoPackerService(
    { shippoClientService },
    {}
  )

  const shippoPackageService = new ShippoPackageService(
    { lineItemService, shippoClientService, shippoPackerService },
    {}
  )

  const shippoRatesService = new ShippoRatesService(
    {
      cartService,
      pricingService,
      shippingProfileService,
      shippoClientService,
      shippoPackageService,
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
      manager,
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
      shippoPackageService,
      shippoPackerService,
      shippoRatesService,
      shippoTrackService,
      shippoTransactionService,
    },
    {}
  )
  return shippoService
}

describe("shippoService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const shippoService = buildShippoService(defaultConfig)

  /* ===================================================== */
  describe("account", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("returns default address", async () => {
      const result = await shippoService.account.address()
      expect(result).toContainEntry(["is_default_sender", true])
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
          const id = "ful_01234567890"
          const result = await shippoService.order.fetchBy(["fulfillment", id])
          expect(result).toContainEntry([
            "object_id",
            "shippo_order_01234567890",
          ])
        })
      })

      describe("local_order", () => {
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

      // TODO
      describe("claim", () => {})

      // TODO
      describe("swap", () => {})
    })

    describe("with", () => {
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
            // const id = "object_id_order_replace_123"
            // const result = await shippoService
            //   .is(["order", id], "replace")
            //   .fetch()
            // expect(result).toBeTrue()
          })
        })
      })
    })
  })
  /* ===================================================== */
})

// console.log('*********result: ', JSON.stringify(result, null, 2))
