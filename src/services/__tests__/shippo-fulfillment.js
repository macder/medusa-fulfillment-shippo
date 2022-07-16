import * as matchers from "jest-extended"
import { faker } from "@faker-js/faker"
import ShippoPackerService from "../shippo-packer"
import ShippoClientService from "../shippo-client"
import ShippoFulfillmentService from "../shippo-fulfillment"
import ShippoRatesService from "../shippo-rates"
import {
  makeArrayOf,
  mockCart,
  mockLineItem,
  mockLineItemTotals,
  mockLiveRate,
  mockShippingOption,
  mockParcelTemplateResponse,
  mockFulfillmentOption,
} from "../__mocks__/data"

expect.extend(matchers)

describe("ShippoFulfillmentService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const totalsService = {
    getLineItemTotals: jest.fn(async (item, order) => mockLineItemTotals()),
  }

  const eventBusService = {
    emit: jest.fn(),
  }

  const options = {
    resolve: `medusa-fulfillment-shippo`,
    options: {
      api_key: "123123",
      webhook_secret: "123123",
      weight_unit_type: "g",
      dimension_unit_type: "cm",
    },
  }
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
      options
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

    const cartService = {
      retrieve: jest.fn(async (cartId, options, totalsConfig) =>
        mockCart({ hasAddress: true, hasItems: 1 })
      ),
    }

    const shippoClientService = new ShippoClientService({}, {})
    const shippoPackerService = new ShippoPackerService(
      { shippoClientService },
      {}
    )
    const shippoRatesService = new ShippoRatesService(
      { shippoClientService, totalsService },
      {}
    )
    const shippoFulfilService = new ShippoFulfillmentService(
      {
        shippoClientService,
        shippoRatesService,
        shippoPackerService,
        cartService,
        totalsService,
      },
      options
    )

    const cart = mockCart({ hasAddress: false, hasItems: 1 })

    describe("live-rate option", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const getResult = async () =>
        await shippoFulfilService.validateFulfillmentData(
          mockFulfillmentOption({ type: "LIVE_RATE" }),
          { test: "test" },
          cart
        )

      it("returned object with correct properties", async () => {
        const result = await getResult()
        expect(result).toContainKeys(["parcel_template", "test"])
      })

      it("parcel_template has id and name properties", async () => {
        const result = await getResult()
        expect(result.parcel_template).toContainKeys(["id", "name"])
      })
    })

    describe("normal option", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const fulfillmentOption = mockFulfillmentOption({ type: "" })
      delete fulfillmentOption.type

      const getResult = async () =>
        await shippoFulfilService.validateFulfillmentData(
          fulfillmentOption,
          { test: "test" },
          cart
        )

      test("returned object with correct properties", async () => {
        const result = await getResult()
        expect(result).toContainKeys(["parcel_template", "test"])
      })

      it("parcel_template has id and name properties", async () => {
        const result = await getResult()
        expect(result.parcel_template).toContainKeys(["id", "name"])
      })
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
      options
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
    const shippoFulfilService = new ShippoFulfillmentService(
      {
        shippoClientService,
      },
      options
    )
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

    const cartService = {
      retrieve: jest.fn(async (cartId, options, totalsConfig) =>
        mockCart({ hasAddress: true, hasItems: 1 })
      ),
    }

    const shippingProfileService = {
      fetchCartOptions: jest.fn((cart) => {
        const shippingOption = mockShippingOption({ variant: "live_rate" })
        return [
          {
            ...shippingOption,
            data: {
              ...shippingOption.data,
              object_id: "123",
              name: "123123",
            },
          },
        ]
      }),
    }

    const shippo = jest.fn(() => ({
      userparceltemplates: {
        list: jest.fn(async () =>
          mockParcelTemplateResponse(
            faker.datatype.number({ min: 10, max: 20 })
          )
        ),
      },
      liverates: {
        create: jest.fn(async () => ({
          results: [
            {
              ...mockLiveRate(),
              title: "123123",
            },
          ],
        })),
      },
    }))

    const shippoClientService = new ShippoClientService({}, {})
    shippoClientService.client_ = shippo()
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
        totalsService,
      },
      {}
    )
    const shippoFulfilService = new ShippoFulfillmentService(
      { cartService, eventBusService, shippoClientService, shippoRatesService },
      options
    )

    it("returns a number", async () => {
      const fulfillmentData = {
        test: "test",
        parcel_template: {
          id: "1010101010",
          name: "im a name",
        },
      }

      const fulfillmentOption = {
        ...mockFulfillmentOption({ type: "live_rate" }),
        object_id: "123",
      }

      const result = await shippoFulfilService.calculatePrice(
        fulfillmentOption,
        fulfillmentData,
        { id: "123123" }
      )

      expect(result).toBeNumber()
    })
  })

  /** **************************
    
      createFulfillment
    
    *****************************/
  describe("createFulfillment", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService(
      {
        shippoClientService,
        totalsService,
        eventBusService,
      },
      options
    )

    const methodData = {
      test: "test",
      rate_at_checkout: mockLiveRate(),
      parcel_template: {
        id: "1010101010",
        name: "im a name",
      },
    }

    const fulfillmentItems = makeArrayOf(mockLineItem, 2)
    const fromOrder = mockCart({ hasAddress: true, hasItems: 2 })
    fromOrder.currency_code = "usd"
    fromOrder.shipping_methods = [
      { shipping_option: mockShippingOption({ variant: "default" }) },
    ]
    const fulfillment = { id: "123" }

    it("returned an object with shippo_order_id prop", async () => {
      const result = await shippoFulfilService.createFulfillment(
        methodData,
        fulfillmentItems,
        fromOrder,
        fulfillment
      )
      expect(result).toBeObject()
      expect(result).toContainKey("shippo_order_id")
    })
  })

  /** **************************
    
      cancelFulfillment
    
    *****************************/
  describe("cancelFulfillment", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoClientService = new ShippoClientService({}, {})
    const shippoFulfilService = new ShippoFulfillmentService(
      {
        shippoClientService,
      },
      options
    )

    it("returns resolved promise", async () => {
      expect.assertions(1)
      await expect(shippoFulfilService.cancelFulfillment()).resolves.toEqual({})
    })
  })

  /** **************************
    
      creatReturn
    
    *****************************/
  // describe("createReturn", () => {
  //   beforeAll(async () => {
  //     jest.clearAllMocks()
  //   })

  //   const shippoClientService = new ShippoClientService({}, {})
  //   const shippoFulfilService = new ShippoFulfillmentService({
  //     shippoClientService,
  //   })

  //   it("returns resolved promise", async () => {
  //     expect.assertions(1)
  //     await expect(shippoFulfilService.createReturn()).resolves.toEqual({})
  //   })
  // })
})
