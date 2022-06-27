import { MockRepository, MockManager, IdMap } from "medusa-test-utils"
import ShippoFulfillmentService from "../shippo-fulfillment"
import data from "../__mocks__/data/temp/shippo-fulfillment-data.json"
import cartData from "../__mocks__/data/temp/cart-data.json"

import {
  makeArrayOfMocks,
  mockCart,
  mockParcelTemplate,
  mockServiceLevel,
} from "../__mocks__/data"

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
    fetchLiveRates: jest.fn(
      async (toAddress, lineItems, shippingOptions, packedParcels) => {}
    ),

    fetchCustomParcelTemplates: jest.fn(() =>
      makeArrayOfMocks(mockParcelTemplate, 4)
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
      // const createFulfillment = await shippoFulfilService.createFulfillment(
      //   {},
      //   data.fulfillmentItems,
      //   data.fromOrder,
      //   {}
      // )
      // expect(shippoClientService.fetchCustomParcel).toHaveBeenCalledWith(
      //   data.fromOrder.metadata.shippo_parcel_template
      // )
      // expect(createFulfillment).toEqual({
      //   shippo_order_id: "d65f4gd654gf",
      //   shippo_parcel_template: data.fromOrder.metadata.shippo_parcel_template,
      // })
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
    // ////////////////////////////////////////////////////////////////

    // it("new empty cart returns validation error message", async () => {
    //   const toAddress = {
    //     name: "null null",
    //     company: null,
    //     street1: null,
    //     street2: null,
    //     street3: "",
    //     city: null,
    //     state: null,
    //     zip: null,
    //     country: "CA",
    //     phone: null,
    //     email: null,
    //     validate: false,
    //   }

    //   const fetchLiveRates = await shippoFulfilService.fetchLiveRates(
    //     "id_new_cart"
    //   )

    //   expect(cartService.retrieve).toHaveBeenCalledWith("id_new_cart", {
    //     relations: [
    //       "shipping_address",
    //       "items",
    //       "items.tax_lines",
    //       "items.variant",
    //       "items.variant.product",
    //       "discounts",
    //       "region",
    //     ],
    //   })
    // })
    // ////////////////////////////////////////////////////////////////
  })

  describe("formatLineItems_", () => {
    const totalsService = {
      getLineItemTotals: jest.fn(async () => data.line_item_totals),
    }

    const shippoFulfilService = new ShippoFulfillmentService({
      totalsService,
      shippoClientService,
    })

    // it("returns correct data format for shippo line item", async () => {
    //   expect(
    //     await shippoFulfilService.formatLineItems_(
    //       data.fulfillmentItems,
    //       data.fromOrder
    //     )
    //   ).toStrictEqual(data.shippo_line_items)
    // })
  })

  describe("canCalculate", () => {
    const shippoFulfilService = new ShippoFulfillmentService({
      shippoClientService,
    })

    // it("returns true when live-rate", async () => {
    //   expect(shippoFulfilService.canCalculate({ type: "LIVE_RATE" })).toBe(true)
    // })

    // it("returns false when free", async () => {
    //   expect(shippoFulfilService.canCalculate({ type: "FREE" })).toBe(false)
    // })

    // it("returns false when flat rate", async () => {
    //   expect(shippoFulfilService.canCalculate({ type: "FLAT" })).toBe(false)
    // })

    it("returns false when type missing", async () => {
      expect(shippoFulfilService.canCalculate({})).toBe(false)
    })
  })

  describe("cancelFulfillment", () => {
    const shippoFulfilService = new ShippoFulfillmentService({
      shippoClientService,
    })

    // it("returns resolved promise", async () => {
    //   expect.assertions(1)
    //   await expect(shippoFulfilService.cancelFulfillment()).resolves.toEqual({})
    // })
  })
})
