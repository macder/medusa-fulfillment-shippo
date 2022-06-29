import { faker } from "@faker-js/faker"
import { MockRepository, MockManager, IdMap } from "medusa-test-utils"
import BinPackerService from "../bin-packer"
import ShippoClientService from "../shippo-client"
import ShippoFulfillmentService from "../shippo-fulfillment"
import {
  makeArrayOf,
  mockCart,
  mockCustomShippingOption,
  mockLineItemTotals,
  mockLiveRate,
  mockShippingOption,
  mockParcelTemplateResponse,
} from "../__mocks__/data"

describe("ShippoFulfillmentService", () => {
  const totalsService = {
    getLineItemTotals: jest.fn(async (item, order) => mockLineItemTotals()),
  }

  describe("getFulfillmentOptions", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService(
      { shippoClientService },
      {}
    )

    it("returned fulfillment options as expected", async () => {
      const result = await shippoFulfilService.getFulfillmentOptions()

      expect(Array.isArray(result)).toBe(true)

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        ])
      )
    })
  })

  describe("validateOption", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService(
      { shippoClientService },
      {}
    )

    it("returned true", async () => {
      const result = await shippoFulfilService.validateOption({ test: "test" })
      expect(result).toEqual(true)
    })
  })

  describe("validateFulfillmentData", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService(
      { shippoClientService },
      {}
    )

    it("returned data object from param", async () => {
      const result = await shippoFulfilService.validateFulfillmentData(
        { test: "test" },
        { test: "test" },
        { test: "test" }
      )
      expect(result).toEqual({ test: "test" })
    })
  })

  describe("cancelFulfillment", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService({
      shippoClientService,
    })

    it("returns resolved promise", async () => {
      expect.assertions(1)
      await expect(shippoFulfilService.cancelFulfillment()).resolves.toEqual({})
    })
  })

  describe("canCalculate", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService({
      shippoClientService,
    })
    it("returns true when live-rate", async () => {
      expect(shippoFulfilService.canCalculate({ type: "LIVE_RATE" })).toBe(true)
    })
    it("returns false when free", async () => {
      expect(shippoFulfilService.canCalculate({ type: "FREE" })).toBe(false)
    })
    it("returns false when flat rate", async () => {
      expect(shippoFulfilService.canCalculate({ type: "FLAT" })).toBe(false)
    })
    it("returns false when type missing", async () => {
      expect(shippoFulfilService.canCalculate({})).toBe(false)
    })
  })

  describe("formatLineItems_", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService({
      shippoClientService,
      totalsService,
    })

    it("is an array of correctly formatted objects", async () => {
      const cart = mockCart({
        hasAddress: true,
        hasItems: faker.datatype.number({ min: 1, max: 6 }),
      })
      const result = await shippoFulfilService.formatLineItems_(
        cart.items,
        cart
      )

      expect(Array.isArray(result)).toBe(true)

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            variant_title: expect.any(String),
            quantity: expect.any(Number),
            total_price: expect.any(String),
            currency: expect.any(String),
            sku: expect.any(String),
            weight: expect.any(String),
            weight_unit: expect.any(String),
            manufacture_country: expect.any(String),
          }),
        ])
      )
    })

    it("returns the same ammount of line items as cart items", async () => {
      const loopCount = faker.datatype.number({ min: 3, max: 6 })

      for (let i = 0; i < loopCount; i++) {
        const itemCount = faker.datatype.number({ min: 1, max: 100 })
        const cart = mockCart({ hasAddress: true, hasItems: itemCount })
        const result = await shippoFulfilService.formatLineItems_(
          cart.items,
          cart
        )
        expect(result.length).toEqual(itemCount)
      }
    })

    it("returns empty array if cart has no items", async () => {
      const cart = mockCart({ hasAddress: true })
      const result = await shippoFulfilService.formatLineItems_(
        cart.items,
        cart
      )
      expect(result.length).toEqual(0)
    })
  })

  describe("retrieveCart_", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const cartService = {
      retrieve: jest.fn(async (cartId, options, totalsConfig) => mockCart({})),
    }

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService({
      shippoClientService,
      cartService,
    })

    const spy = jest.spyOn(cartService, "retrieve")

    it("called cartService.retrieve with correct params", async () => {
      shippoFulfilService.retrieveCart_(2)

      expect(spy).toHaveBeenCalledWith(2, {
        relations: [
          "shipping_address",
          "items",
          "items.tax_lines",
          "items.variant",
          "items.variant.product",
          "discounts",
          "region",
        ],
      })
    })
  })

  describe("fetchLiveRates", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const mockLiveRates = (titles) =>
      makeArrayOf(mockLiveRate, titles.length).map((item, i) => ({
        ...item,
        title: titles[i],
      }))

    const mockShippingOptions = (titles) =>
      makeArrayOf(mockShippingOption, titles.length, {
        variant: "service_group",
      }).map((item, i) => {
        item.data.name = titles[i]
        return item
      })

    const liveRateTitles = faker.helpers.uniqueArray(
      () => faker.random.words(4),
      5
    )
    const liveRates = mockLiveRates(liveRateTitles)
    const shippingOptionTitles = faker.helpers.arrayElements(liveRateTitles)
    const shippingOptions = mockShippingOptions(shippingOptionTitles)

    const shippo = jest.fn(() => ({
      userparceltemplates: {
        list: jest.fn(async () =>
          mockParcelTemplateResponse(
            faker.datatype.number({ min: 20, max: 50 })
          )
        ),
      },
      liverates: {
        create: jest.fn(async () => ({ results: liveRates })),
      },
    }))

    const shippingProfileService = {
      fetchCartOptions: jest.fn(async (cart) => shippingOptions),
    }

    const shippoClientService = new ShippoClientService({}, {})
    shippoClientService.client_ = shippo()

    const binPackerService = new BinPackerService({}, {})

    describe("cart with items and complete address", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const cartService = {
        retrieve: jest.fn(async (cartId, options, totalsConfig) =>
          mockCart({
            hasAddress: true,
            hasItems: faker.datatype.number({ min: 1, max: 3 }),
          })
        ),
      }

      const shippoFulfilService = new ShippoFulfillmentService({
        binPackerService,
        shippoClientService,
        shippingProfileService,
        cartService,
        totalsService,
      })

      it("returned array", async () => {
        const result = await shippoFulfilService.fetchLiveRates()
        expect(Array.isArray(result)).toBe(true)
      })

      test("liverate count is equal to shipping option count", async () => {
        const result = await shippoFulfilService.fetchLiveRates()
        expect(result.length).toBe(shippingOptions.length)
      })

      it("live rate objects have correct property names", async () => {
        const result = await shippoFulfilService.fetchLiveRates()

        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: expect.any(String),
              amount: expect.any(String),
              currency: expect.any(String),
              amount_local: expect.any(String),
              currency_local: expect.any(String),
            }),
          ])
        )
      })
    })
  })
})
