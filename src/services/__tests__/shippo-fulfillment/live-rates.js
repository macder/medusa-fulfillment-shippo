import * as matchers from "jest-extended"
import { faker } from "@faker-js/faker"
import { MockRepository, MockManager, IdMap } from "medusa-test-utils"
import ShippoPackerService from "../../shippo-packer"
import ShippoClientService from "../../shippo-client"
import ShippoFulfillmentService from "../../shippo-fulfillment"
import {
  makeArrayOf,
  mockCart,
  mockCustomShippingOption,
  mockLineItemTotals,
  mockLiveRate,
  mockShippingOption,
  mockShippoBinPack,
  mockParcelTemplateResponse,
} from "../../__mocks__/data"

expect.extend(matchers)

describe("ShippoFulfillmentService", () => {
  describe("live-rates", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const totalsService = {
      getLineItemTotals: jest.fn(async (item, order) => mockLineItemTotals()),
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

    /** **************************
    
      fetchLiveRates
    
    ****************************/
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
          expect(result).toBeArray()
        })

        test("liverate count is equal to shipping option count", async () => {
          const result = await shippoFulfilService.fetchLiveRates()
          expect(result).toHaveLength(shippingOptions.length)
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

    /** **************************
    
      findRate_
    
    ****************************/
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

    /** **************************
    
      updateShippingRates
    
    ****************************/
    describe("updateShippingRates", () => {
      // TODO: WIP
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
        setMetadata: jest.fn(async (cartId, key, value) => {}),
      }

      const customShippingOptionService = {
        create: jest.fn(async (shippingOption, rate, cartId) =>
          mockCustomShippingOption()
        ),
        list: jest.fn(async ({ cart_id }) => {
          return makeArrayOf(mockCustomShippingOption, 4)
        }),
      }

      const manager = MockManager
      const customShippingOptionRepository = MockRepository()

      const shippoFulfilService = new ShippoFulfillmentService({
        cartService,
        customShippingOptionService,
        customShippingOptionRepository,
        shippoPackerService,
        shippoClientService,
        shippingProfileService,
        totalsService,
        manager,
      })

      const result = async () =>
        await shippoFulfilService.updateShippingRates("cart_123")

      it("cartService.retrieve was called using correct params", async () => {
        const spy = jest.spyOn(cartService, "retrieve")
        await result()

        expect(spy).toHaveBeenCalledWith("cart_123", {
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

      it("invoked method to retrieve cart's shipping options", async () => {
        const spy = jest.spyOn(shippingProfileService, "fetchCartOptions")
        await result()

        expect(spy).toHaveBeenCalled()
      })

      it("invoked fetch for userparceltemplates", async () => {
        const spy = jest.spyOn(
          shippoClientService.client_.userparceltemplates,
          "list"
        )
        await result()

        expect(spy).toHaveBeenCalled()
      })

      it("invoked fetch for live-rates", async () => {
        const spy = jest.spyOn(shippoClientService.client_.liverates, "create")
        await result()

        expect(spy).toHaveBeenCalled()
      })
    })

    /** **************************
    
      getPrice_
    
    ****************************/
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

    /** **************************
    
      findShippingOptionTypes_
    
    ****************************/
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

        expect(result).toBeArray()
        expect(result).toHaveLength(0)
      })
    })

    /** **************************
    
      createCustomShippingOption_
    
    ****************************/
    describe("createCustomShippingOption_", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const customShippingOptionService = {
        create: jest.fn(async (shippingOption, rate, cartId) => {}),
      }

      const spy = jest.spyOn(customShippingOptionService, "create")

      const shippoClientService = new ShippoClientService({}, {})
      const shippoFulfilService = new ShippoFulfillmentService({
        shippoClientService,
        customShippingOptionService,
      })

      shippoFulfilService.binPackResults_ = mockShippoBinPack()

      const shippingOption = mockShippingOption({ variant: "live_rate" })
      const rate = mockLiveRate()

      const createCustomShippingOtion = async () =>
        await shippoFulfilService.createCustomShippingOption_(
          shippingOption,
          shippoFulfilService.getPrice_(rate),
          "cart_418",
          rate
        )

      it("called customShippingOptionService.create with correct params", async () => {
        await createCustomShippingOtion()

        expect(spy).toHaveBeenCalledWith(
          {
            cart_id: "cart_418",
            shipping_option_id: shippingOption.id,
            price: shippoFulfilService.getPrice_(rate),
          },
          {
            metadata: {
              is_shippo_rate: true,
              ...rate,
              shippo_binpack: shippoFulfilService.binPackResults_,
            },
          }
        )
      })
    })

    /** **************************
    
      setCartMeta_
    
    ****************************/
    describe("setCartMeta_", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const cartService = {
        setMetadata: jest.fn(async (cartId, key, value) => {}),
      }

      const spy = jest.spyOn(cartService, "setMetadata")

      const shippoClientService = new ShippoClientService({}, {})
      const shippoFulfilService = new ShippoFulfillmentService({
        shippoClientService,
        cartService,
      })

      test("cartService.setMetadata was called with correct params", async () => {
        const customShippingOptions = makeArrayOf(mockCustomShippingOption, 2)
        shippoFulfilService.setCartMeta_("cart_123", customShippingOptions)

        const expectedMetaValue = {
          parcel_templace_id:
            customShippingOptions[0].metadata.shippo_binpack[0].object_id,
          parcel_template_name:
            customShippingOptions[0].metadata.shippo_binpack[0].name,
          custom_shipping_options: customShippingOptions.map((e) => e.id),
        }

        expect(spy).toHaveBeenCalledWith(
          "cart_123",
          "shippo",
          expectedMetaValue
        )
      })
    })
  })
})
