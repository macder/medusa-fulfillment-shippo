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

  describe("fetchCartOptions", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const cartService = {
      retrieve: jest.fn(async (id) => {
        return mockCart({ hasAddress: true, hasItems: 1 })
      }),
    }

    const shippingProfileService = {
      fetchCartOptions: jest.fn(async (cart) => {
        const soCalculated = [mockShippingOption({ variant: "live_rate" })]
        const soFlatRate = [mockShippingOption({ variant: "default" })]
        soCalculated[0].data.name = "testing 123"
        return soCalculated.concat(soFlatRate)
      }),
    }

    const shippoClientService = new ShippoClientService({}, {})
    const shippoPackerService = new ShippoPackerService(
      { shippoClientService },
      {}
    )
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
      const result = await shippoRatesService.fetchCartOptions("cart_id")
      result.forEach((result) => {
        if (result.data.type === "LIVE_RATE") {
          expect(result.amount).toBeNumber()
        }
      })
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
