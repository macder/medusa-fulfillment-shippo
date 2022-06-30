import { faker } from "@faker-js/faker"
import { MockRepository, MockManager, IdMap } from "medusa-test-utils"
import ShippoPackerService from "../shippo-packer"
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

    it("returned an array", async () => {
      const result = await shippoFulfilService.getFulfillmentOptions()
      expect(Array.isArray(result)).toBe(true)
    })

    it("returned array of object that have id and name properties", async () => {
      const result = await shippoFulfilService.getFulfillmentOptions()

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

    const cart = mockCart({
      hasAddress: true,
      hasItems: faker.datatype.number({ min: 1, max: 6 }),
    })

    it("returned an array", async () => {
      const result = await shippoFulfilService.formatLineItems_(
        cart.items,
        cart
      )

      expect(Array.isArray(result)).toBe(true)
    })

    it("returned array of object with correct property names", async () => {
      const result = await shippoFulfilService.formatLineItems_(
        cart.items,
        cart
      )

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

  describe("live-rates", () => {
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
        variant: "live_rate",
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

    const shippoPackerService = new ShippoPackerService({}, {})

    describe("fetchLiveRates", () => {
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
          shippoPackerService,
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

    describe("findRate_", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const shippoFulfilService = new ShippoFulfillmentService(
        {
          shippoClientService,
        },
        {}
      )

      it("returns rate object that matches shipping option", async () => {
        shippingOptions.forEach((shippingOption) => {
          const result = shippoFulfilService.findRate_(
            shippingOption,
            liveRates
          )

          expect(result.title).toBe(shippingOption.data.name)
        })
      })
    })
  })

  describe("getPrice_", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService({}, {})

    const shippoFulfilService = new ShippoFulfillmentService(
      {
        shippoClientService,
      },
      {}
    )

    it("returns price from amount * 100", async () => {
      const rate = {
        amount: "93.56",
        amount_local: "",
      }
      const result = shippoFulfilService.getPrice_(rate)

      expect(result).toBe(9356)
    })

    it("returns price from amount_local * 100", async () => {
      const rate = {
        amount: "93.56",
        amount_local: "41.8",
      }
      const result = shippoFulfilService.getPrice_(rate)

      expect(result).toBe(4180)
    })
  })

  describe("findShippingOptionTypes_", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const cart = mockCart({
      hasAddress: true,
      hasItems: faker.datatype.number({ min: 1, max: 6 }),
    })

    const shippingOptions = faker.helpers.shuffle(
      makeArrayOf(mockShippingOption, 5, { variant: "live_rate" }).concat(
        makeArrayOf(mockShippingOption, 5, { variant: "flat_rate" }),
        makeArrayOf(mockShippingOption, 5, { variant: "free" })
      )
    )

    const shippingProfileService = {
      fetchCartOptions: jest.fn(async (cart) => shippingOptions),
    }

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService({
      shippoClientService,
      shippingProfileService,
    })

    it("returns only LIVE_RATE shipping option types", async () => {
      const result = await shippoFulfilService.findShippingOptionTypes_(
        "LIVE_RATE",
        cart
      )
      result.forEach((item) => expect(item.data.type).toBe("LIVE_RATE"))
    })

    it("returns only FLAT_RATE shipping option types", async () => {
      const result = await shippoFulfilService.findShippingOptionTypes_(
        "FLAT_RATE",
        cart
      )
      result.forEach((item) => expect(item.data.type).toBe("FLAT_RATE"))
    })

    it("returns only FREE_SHIPPING shipping option types", async () => {
      const result = await shippoFulfilService.findShippingOptionTypes_(
        "FREE_SHIPPING",
        cart
      )
      result.forEach((item) => expect(item.data.type).toBe("FREE_SHIPPING"))
    })

    it("returns empty array when shipping option type not found", async () => {
      const result = await shippoFulfilService.findShippingOptionTypes_(
        "VOID",
        cart
      )

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toEqual(0)
    })
  })
})
