import * as matchers from "jest-extended"
import ShippoPackerService from "../shippo-packer"
import ShippoClientService from "../shippo-client"
import ShippoRatesService from "../shippo-rates"

import {
  mockCart,
  mockLineItemTotals,
  mockShippingOption,
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

  const getCartService = (cart) => ({
    retrieve: jest.fn(async (id) => cart),
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

  const shippoClientService = new ShippoClientService({}, {})
  const shippoPackerService = new ShippoPackerService(
    { shippoClientService },
    {}
  )
  const getShippoRatesService = (cartService) =>
    new ShippoRatesService(
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

  describe("fetchCartOptions", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    /* ===================================================== */
    describe("cart has items, address, email", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const cart = mockCart({ hasAddress: true, hasItems: 1 })
      const cartService = getCartService(cart)
      const shippoRatesService = getShippoRatesService(cartService)

      test("calculated options prop.amount is number", async () => {
        const result = await shippoRatesService.decorateOptions(
          "cart_id",
          mockCartShippingOptions()
        )
        result.forEach((result) => {
          if (result.data.type === "LIVE_RATE") {
            expect(result.amount).toBeNumber()
          }
        })
      })
    })
    /* ===================================================== */

    /* ===================================================== */
    describe("cart has no items, no address, no email", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const cart = mockCart({ hasAddress: false, hasItems: false })
      cart.shipping_address = null
      const cartService = getCartService(cart)
      const shippoRatesService = getShippoRatesService(cartService)

      test("calculated options prop.amount is null", async () => {
        const result = await shippoRatesService.decorateOptions(
          "cart_id",
          mockCartShippingOptions()
        )
        result.forEach((result) => {
          if (result.data.type === "LIVE_RATE") {
            expect(result.amount).toBeNull()
          }
        })
      })
    })
    /* ===================================================== */

    /* ===================================================== */
    describe("cart has items, no address, no email", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const cart = mockCart({ hasAddress: false, hasItems: 1 })
      const cartService = getCartService(cart)
      const shippoRatesService = getShippoRatesService(cartService)

      test("calculated options prop.amount is null", async () => {
        const result = await shippoRatesService.decorateOptions(
          "cart_id",
          mockCartShippingOptions()
        )
        result.forEach((result) => {
          if (result.data.type === "LIVE_RATE") {
            expect(result.amount).toBeNull()
          }
        })
      })
    })
    /* ===================================================== */

    /* ===================================================== */
    describe("cart has items, address, no email", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const cart = mockCart({ hasAddress: true, hasItems: 1 })
      cart.email = null

      const cartService = getCartService(cart)
      const shippoRatesService = getShippoRatesService(cartService)

      test("calculated options prop.amount is null", async () => {
        const result = await shippoRatesService.decorateOptions(
          "cart_id",
          mockCartShippingOptions()
        )
        result.forEach((result) => {
          if (result.data.type === "LIVE_RATE") {
            expect(result.amount).toBeNull()
          }
        })
      })
    })
    /* ===================================================== */

    /* ===================================================== */
    describe("cart has items, email, no address", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const cart = mockCart({ hasAddress: false, hasItems: 1 })
      cart.email = "test@test.com"
      const cartService = getCartService(cart)
      const shippoRatesService = getShippoRatesService(cartService)

      test("calculated options prop.amount is null", async () => {
        const result = await shippoRatesService.decorateOptions(
          "cart_id",
          mockCartShippingOptions()
        )
        result.forEach((result) => {
          if (result.data.type === "LIVE_RATE") {
            expect(result.amount).toBeNull()
          }
        })
      })
    })
    /* ===================================================== */

    /* ===================================================== */
    describe("cart has address, no items, no email", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const cart = mockCart({ hasAddress: true, hasItems: false })
      cart.email = null

      const cartService = getCartService(cart)
      const shippoRatesService = getShippoRatesService(cartService)

      test("calculated options prop.amount is null", async () => {
        const result = await shippoRatesService.decorateOptions(
          "cart_id",
          mockCartShippingOptions()
        )
        result.forEach((result) => {
          if (result.data.type === "LIVE_RATE") {
            expect(result.amount).toBeNull()
          }
        })
      })
    })
    /* ===================================================== */

    /* ===================================================== */
    describe("cart has address, email, no items", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const cart = mockCart({ hasAddress: true, hasItems: false })
      const cartService = getCartService(cart)
      const shippoRatesService = getShippoRatesService(cartService)

      test("calculated options prop.amount is null", async () => {
        const result = await shippoRatesService.decorateOptions(
          "cart_id",
          mockCartShippingOptions()
        )
        result.forEach((result) => {
          if (result.data.type === "LIVE_RATE") {
            expect(result.amount).toBeNull()
          }
        })
      })
    })
    /* ===================================================== */

    /* ===================================================== */
    describe("cart has email, no address, no items", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const cart = mockCart({ hasAddress: false, hasItems: false })
      cart.email = "test@test.com"
      const cartService = getCartService(cart)
      const shippoRatesService = getShippoRatesService(cartService)

      test("calculated options prop.amount is null", async () => {
        const result = await shippoRatesService.decorateOptions(
          "cart_id",
          mockCartShippingOptions()
        )
        result.forEach((result) => {
          if (result.data.type === "LIVE_RATE") {
            expect(result.amount).toBeNull()
          }
        })
      })
    })
    /* ===================================================== */
  })

  describe("fetchCartRates", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const cart = mockCart({ hasAddress: false, hasItems: 1 })
    const cartService = getCartService(cart)
    const shippoRatesService = getShippoRatesService(cartService)

    it("returns array", async () => {
      const result = await shippoRatesService.fetchCartRates("cart_id")
      expect(result).toBeArray()
    })

    test("array members are objects", async () => {
      const result = await shippoRatesService.fetchCartRates("cart_id")
      result.forEach((result) => {
        expect(result).toBeObject()
      })
    })

    test("rate objects have parcel property", async () => {
      const result = await shippoRatesService.fetchCartRates("cart_id")
      result.forEach((result) => {
        expect(result).toContainKey("parcel")
      })
    })
  })

  describe("fetchOptionRate", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    describe("option param is id", () => {
      /* ===================================================== */
      describe("cart is ready", () => {
        beforeAll(async () => {
          jest.clearAllMocks()
        })

        const cart = mockCart({ hasAddress: true, hasItems: 1 })
        const cartService = getCartService(cart)
        const shippoRatesService = getShippoRatesService(cartService)

        it("returned an object", async () => {
          const result = await shippoRatesService.fetchOptionRate(
            "cart_id",
            "so_id"
          )
          expect(result).toBeObject()
        })

        test("object has parcel prop", async () => {
          const result = await shippoRatesService.fetchOptionRate(
            "cart_id",
            "so_id"
          )
          expect(result).toContainKey("parcel")
        })
      })
      /* ===================================================== */

      /* ===================================================== */
      describe("cart not ready", () => {
        beforeAll(async () => {
          jest.clearAllMocks()
        })

        const cart = mockCart({ hasAddress: false, hasItems: 1 })
        const cartService = getCartService(cart)
        const shippoRatesService = getShippoRatesService(cartService)

        test("returned promise.reject", async () => {
          expect(
            async () =>
              await shippoRatesService.fetchOptionRate("cart_id", "so_id")
          ).rejects.toEqual({ error: "cart not ready" })
        })
      })
      /* ===================================================== */
    })

    describe("option param is FulfillmentOption", () => {
      const option = {
        name: "testing 123",
        object_id: "object_id",
      }

      /* ===================================================== */
      describe("cart is ready", () => {
        beforeAll(async () => {
          jest.clearAllMocks()
        })

        const cart = mockCart({ hasAddress: true, hasItems: 1 })
        const cartService = getCartService(cart)
        const shippoRatesService = getShippoRatesService(cartService)

        it("returned an object", async () => {
          const result = await shippoRatesService.fetchOptionRate(
            "cart_id",
            option
          )
          expect(result).toBeObject()
        })

        test("object has parcel prop", async () => {
          const result = await shippoRatesService.fetchOptionRate(
            "cart_id",
            option
          )
          expect(result).toContainKey("parcel")
        })
      })
      /* ===================================================== */

      /* ===================================================== */
      describe("cart not ready", () => {
        beforeAll(async () => {
          jest.clearAllMocks()
        })

        const cart = mockCart({ hasAddress: false, hasItems: 1 })
        const cartService = getCartService(cart)
        const shippoRatesService = getShippoRatesService(cartService)

        test("returned promise.reject", async () => {
          expect(
            async () =>
              await shippoRatesService.fetchOptionRate("cart_id", option)
          ).rejects.toEqual({ error: "cart not ready" })
        })
      })
      /* ===================================================== */
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
