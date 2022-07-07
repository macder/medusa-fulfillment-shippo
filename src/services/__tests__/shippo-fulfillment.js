import * as matchers from "jest-extended"
import { faker } from "@faker-js/faker"
import { MockRepository, MockManager, IdMap } from "medusa-test-utils"
import ShippoPackerService from "../shippo-packer"
import ShippoClientService from "../shippo-client"
import ShippoFulfillmentService from "../shippo-fulfillment"
import ShippoRatesService from "../shippo-rates"
import {
  makeArrayOf,
  mockCart,
  mockCustomShippingOption,
  mockLineItemTotals,
  mockLiveRate,
  mockShippingOption,
  mockShippoBinPack,
  mockPackerOutput,
  mockParcelTemplateResponse,
} from "../__mocks__/data"

expect.extend(matchers)

describe("ShippoFulfillmentService", () => {
  /** **************************
    
      getFulfillmentOptions
    
    ****************************/
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
      expect(result).toBeArray()
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

  /** **************************
    
      validateFulfillmentData
    
    *****************************/
  describe("validateFulfillmentData", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoRatesService = {
      packBins: jest.fn(async (items) => makeArrayOf(mockShippoBinPack, 1)),
    }

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService(
      { shippoClientService, shippoRatesService },
      {}
    )

    it("returned object with correct properties", async () => {
      const cart = mockCart({ hasAddress: true, hasItems: 1 })
      const result = await shippoFulfilService.validateFulfillmentData(
        {},
        { test: "test" },
        cart
      )

      expect(result).toContainKeys(["test", "parcel_template"])
      expect(result.parcel_template).toContainKeys(["id", "name"])
    })
  })

  /** **************************
    
      validateOption
    
    *****************************/
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
      const result = await shippoFulfilService.validateOption({
        test: "test",
      })
      expect(result).toEqual(true)
    })
  })

  /** **************************
    
      canCalculate
    
    *****************************/
  describe("canCalculate", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService({
      shippoClientService,
    })
    it("returns true when live-rate", async () => {
      expect(
        await shippoFulfilService.canCalculate({ type: "LIVE_RATE" })
      ).toBe(true)
    })
    it("returns false when free", async () => {
      expect(await shippoFulfilService.canCalculate({ type: "FREE" })).toBe(
        false
      )
    })
    it("returns false when flat rate", async () => {
      expect(await shippoFulfilService.canCalculate({ type: "FLAT" })).toBe(
        false
      )
    })
    it("returns false when type missing", async () => {
      expect(await shippoFulfilService.canCalculate({})).toBe(false)
    })
  })

  /** **************************
    
      calculatePrice
    
    *****************************/
  describe("calculatePrice", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("", () => {})
  })

  /** **************************
    
      createFulfillment
    
    *****************************/
  describe("createFulfillment", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("", () => {})
  })

  /** **************************
    
      cancelFulfillment
    
    *****************************/
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

  /** **************************
  
    formatLineItems_
  
  *****************************/
  describe("formatLineItems_", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const totalsService = {
      getLineItemTotals: jest.fn(async (item, order) => mockLineItemTotals()),
    }

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

      expect(result).toBeArray()
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
        expect(result).toHaveLength(itemCount)
      }
    })

    it("returns empty array if cart has no items", async () => {
      const cart = mockCart({ hasAddress: true })
      const result = await shippoFulfilService.formatLineItems_(
        cart.items,
        cart
      )
      expect(result).toHaveLength(0)
    })
  })

  /** **************************
  
    retrieveCart_
  
  *****************************/
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
})
