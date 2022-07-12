import * as matchers from "jest-extended"
import { faker } from "@faker-js/faker"

import ShippoPackerService from "../shippo-packer"
import ShippoClientService from "../shippo-client"
import ShippoFulfillmentService from "../shippo-fulfillment"
import ShippoRatesService from "../shippo-rates"

import {
  mockAddress,
  makeArrayOf,
  mockBlankCart,
  mockCart,
  mockCustomShippingOption,
  mockLineItemTotals,
  mockLiveRate,
  mockShippingOption,
  mockShippoBinPack,
  mockParcelTemplateResponse,
} from "../__mocks__/data"

expect.extend(matchers)

describe("ShippoRatesService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const totalsService = {
    getLineItemTotals: jest.fn(async (item, order) => mockLineItemTotals()),
  }

  const pricingService = {
    setShippingOptionPrices: jest.fn(async (options) => options),
  }

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
        mockParcelTemplateResponse(faker.datatype.number({ min: 10, max: 20 }))
      ),
    },
    liverates: {
      create: jest.fn(async () => ({ results: liveRates })),
    },
  }))

  const shippingProfileService = {
    fetchCartOptions: jest.fn((cart) => shippingOptions),
  }

  describe("fetchCartOptions", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const cartService = {
      retrieve: jest.fn(async (id) => {
        return mockCart({ hasAddress: true, hasItems: 1 })
      }),
    }

    const shippoClientService = new ShippoClientService({}, {})
    shippoClientService.client_ = shippo()
    const shippoPackerService = new ShippoPackerService({}, {})
    const shippoRatesService = new ShippoRatesService(
      {
        cartService,
        shippingProfileService,
        shippoClientService,
        shippoPackerService,
        pricingService,
        totalsService,
      },
      {}
    )

    it("returned shipping options that are live-rate have a price", async () => {
      // const cart = mockCart({ hasAddress: true, hasItems: 1 })

      const result = await shippoRatesService.fetchCartOptions("cart_id")

      result.forEach((result) => {
        if (result.data.type === "LIVE_RATE") {
          expect(result.amount).toBeNumber()
        }
      })
    })
  })

  describe("isCartReady_", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    // const cartService = {
    //   retrieve: jest.fn(
    //     async (cart_id) => {
    //       if(cart_id === 'id_noEmail_noAddress_noItems') {
    //         return mockCart({ hasAddress: false, hasItems: 0 })
    //       }

    //     }
    //   )
    // }

    const shippoRatesService = new ShippoRatesService({}, {})

    it("returns false when cart is new (no email, no address id, no items)", async () => {
      const cart = mockBlankCart()
      shippoRatesService.setCart_(cart)

      const result = await shippoRatesService.isCartReady_()
      expect(result).toBeFalse()
    })

    it("returns false when cart only has email", async () => {
      const cart = mockBlankCart()
      cart.email = "test@test.com"
      shippoRatesService.setCart_(cart)

      const result = await shippoRatesService.isCartReady_()
      expect(result).toBeFalse()
    })

    it("returns false when cart has undecorated shipping_address object", async () => {
      const cart = mockBlankCart()
      cart.shipping_address = mockAddress(false)
      shippoRatesService.setCart_(cart)

      const result = await shippoRatesService.isCartReady_()
      expect(result).toBeFalse()
    })

    it("returns false when cart has email and undecorated shipping_address object", async () => {
      const cart = mockBlankCart()
      cart.shipping_address = mockAddress(false)
      cart.email = "test@test.com"
      shippoRatesService.setCart_(cart)

      const result = await shippoRatesService.isCartReady_()
      expect(result).toBeFalse()
    })

    it("returns false when cart has email and shipping address but no line items", async () => {
      const cart = mockBlankCart()
      cart.shipping_address = mockAddress()
      cart.email = "test@test.com"
      shippoRatesService.setCart_(cart)

      const result = await shippoRatesService.isCartReady_()
      expect(result).toBeFalse()
    })

    it("returns false when cart has shipping address and line items, but no email", async () => {
      const cart = mockCart({ hasAddress: true, hasItems: false })
      cart.email = null
      shippoRatesService.setCart_(cart)

      const result = await shippoRatesService.isCartReady_()
      expect(result).toBeFalse()
    })

    it("returns false when cart has line items and email, but undecorated address", async () => {
      const cart = mockCart({ hasAddress: false, hasItems: 1 })
      cart.email = "test@test.com"
      shippoRatesService.setCart_(cart)

      const result = await shippoRatesService.isCartReady_()
      expect(result).toBeFalse()
    })

    it("returns false when cart has address and email, but no line items", async () => {
      const cart = mockCart({ hasAddress: true, hasItems: 1 })
      cart.items = []
      shippoRatesService.setCart_(cart)

      const result = await shippoRatesService.isCartReady_()
      expect(result).toBeFalse()
    })

    it("returns false when cart has line items, email, and address without first/last name", async () => {
      const cart = mockCart({ hasAddress: true, hasItems: 1 })
      cart.shipping_address.first_name = null
      cart.shipping_address.last_name = null
      shippoRatesService.setCart_(cart)

      const result = await shippoRatesService.isCartReady_()
      expect(result).toBeFalse()
    })

    it("returns false when cart has line items, email, and address with missing fields", async () => {
      const cart = mockCart({ hasAddress: true, hasItems: 1 })
      cart.shipping_address.address_1 = null
      cart.shipping_address.postal_code = null
      shippoRatesService.setCart_(cart)

      const result = await shippoRatesService.isCartReady_()
      expect(result).toBeFalse()
    })

    it("returns true when cart has line items, email, and address", async () => {
      const cart = mockCart({ hasAddress: true, hasItems: 1 })
      shippoRatesService.setCart_(cart)

      const result = await shippoRatesService.isCartReady_()
      expect(result).toBeTrue()
    })
  })

  describe("requiresRates_", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoRatesService = new ShippoRatesService({}, {})

    it("returns false when no LIVE_RATE shipping options", async () => {
      const shippingOptions = makeArrayOf(mockShippingOption, 3, {
        variant: "default",
      })
      shippoRatesService.setOptions_(shippingOptions)

      const result = await shippoRatesService.requiresRates_()
      expect(result).toBeFalse()
    })

    it("returns true when LIVE_RATE shipping options present", async () => {
      const shippingOptions = makeArrayOf(mockShippingOption, 3, {
        variant: "default",
      }).concat(makeArrayOf(mockShippingOption, 2, { variant: "live_rate" }))

      shippoRatesService.setOptions_(shippingOptions)

      const result = await shippoRatesService.requiresRates_()
      expect(result).toBeTrue()
    })
  })

  describe("getPrice", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoRatesService = new ShippoRatesService({}, {})

    it("returns price from amount * 100", async () => {
      const rate = {
        amount: "93.56",
        amount_local: "",
      }
      const result = shippoRatesService.getPrice(rate)

      expect(result).toBe(9356)
    })

    it("returns price from amount_local * 100", async () => {
      const rate = {
        amount: "93.56",
        amount_local: "41.8",
      }
      const result = shippoRatesService.getPrice(rate)

      expect(result).toBe(4180)
    })
  })
})
