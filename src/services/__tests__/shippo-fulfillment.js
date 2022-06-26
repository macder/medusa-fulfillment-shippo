import { MockRepository, MockManager, IdMap } from "medusa-test-utils"
import ShippoFulfillmentService from "../shippo-fulfillment"
import data from "../__mocks__/shippo-fulfillment-data.json"
import cartData from "../__mocks__/cart-data.json"
import { faker } from "@faker-js/faker"

describe("ShippoFulfillmentService", () => {
  const shippoClientService = {
    getClient: jest.fn(),
    fetchCustomParcel: jest.fn(() => {
      // TODO: use ID
      return data.user_parcel_template
    }),
    createOrder: jest.fn(async () => {
      return {
        object_id: "d65f4gd654gf",
      }
    }),
    fetchLiveRates: jest.fn(),

    fetchCustomParcelTemplates: jest.fn(() =>
      [...Array(4).keys()].map((e) => ({
        object_id: faker.database.mongodbObjectId(),
        object_owner: faker.internet.email(),
        object_created: faker.date.past(),
        object_updated: faker.date.past(),
        name: faker.random.words(4),
        length: faker.datatype.number({ min: 20, max: 100 }),
        width: faker.datatype.number({ min: 20, max: 100 }),
        height: faker.datatype.number({ min: 20, max: 100 }),
        distance_unit: "cm",
        weight: faker.datatype.number({ min: 200, max: 3000 }),
        weight_unit: "g",
      }))
    ),
  }

  describe("createFulfillment", () => {
    const totalsService = {
      getLineItemTotals: jest.fn(async () => data.line_item_totals),
    }

    const shippoFulfilService = new ShippoFulfillmentService({
      totalsService,
      shippoClientService,
    })

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("successfully created a shippo order", async () => {
      const createFulfillment = await shippoFulfilService.createFulfillment(
        {},
        data.fulfillmentItems,
        data.fromOrder,
        {}
      )

      expect(shippoClientService.fetchCustomParcel).toHaveBeenCalledWith(
        data.fromOrder.metadata.shippo_parcel_template
      )

      expect(createFulfillment).toEqual({
        shippo_order_id: "d65f4gd654gf",
        shippo_parcel_template: data.fromOrder.metadata.shippo_parcel_template,
      })
    })
  })

  describe("fetchLiveRates", () => {
    const cartService = {
      retrieve: jest.fn((id) => {
        return cartData[id]
      }),
    }

    const shippingProfileService = {
      fetchCartOptions: jest.fn(async (cart) => {
        return []
        // const { shipping_address } = cart
        // const validFields = Object.entries(shipping_address)
        //   .map((field) => field[1] && field[0])
        //   .filter((field) => field)

        // console.log(validFields)

        // if (validFields.length === 0) {
        //   return []
        // }
      }),
    }

    const shippoFulfilService = new ShippoFulfillmentService({
      shippingProfileService,
      cartService,
      shippoClientService,
    })

    it("new empty cart returns validation error message", async () => {
      await expect(shippoFulfilService.fetchLiveRates("id_new_cart")).toEqual(
        {}
      )
    })
  })

  describe("formatLineItems_", () => {
    const totalsService = {
      getLineItemTotals: jest.fn(async () => data.line_item_totals),
    }

    const shippoFulfilService = new ShippoFulfillmentService({
      totalsService,
      shippoClientService,
    })

    it("returns correct data format for shippo line item", async () => {
      expect(
        await shippoFulfilService.formatLineItems_(
          data.fulfillmentItems,
          data.fromOrder
        )
      ).toStrictEqual(data.shippo_line_items)
    })
  })

  describe("canCalculate", () => {
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

  describe("cancelFulfillment", () => {
    const shippoFulfilService = new ShippoFulfillmentService({
      shippoClientService,
    })

    it("returns resolved promise", async () => {
      expect.assertions(1)
      await expect(shippoFulfilService.cancelFulfillment()).resolves.toEqual({})
    })
  })
})
