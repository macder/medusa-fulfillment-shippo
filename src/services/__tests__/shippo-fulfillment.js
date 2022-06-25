import { MockRepository, MockManager, IdMap } from "medusa-test-utils"
import ShippoFulfillmentService from "../shippo-fulfillment"
import data from "../__mocks__/shippo-fulfillment-data.json"

describe("ShippoFulfillmentService", () => {
  describe("createFulfillment", () => {
    const totalsService = {
      getLineItemTotals: jest.fn(async (item, order) => data.line_item_totals),
      create: jest.fn(),
    }

    const shippoClientService = {
      getClient: jest.fn(),
      fetchCustomParcel: jest.fn((id) => {
        // TODO: use ID
        return data.user_parcel_template
      }),
      createOrder: jest.fn(async (order) => {
        return {
          object_id: "d65f4gd654gf",
        }
      }),
    }

    const shippoFulfillmentService = new ShippoFulfillmentService({
      totalsService,
      shippoClientService,
    })

    beforeAll(async () => {
      jest.clearAllMocks()
    })

    it("successfully created a shippo order", async () => {
      const createFulfillment =
        await shippoFulfillmentService.createFulfillment(
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
      setMetadata: jest.fn(),
      retrieve: jest.fn(),
    }

    const shippingProfileService = {
      fetchCartOptions: jest.fn(),
    }

    const shippoClientService = {
      getClient: jest.fn(),
      fetchCustomParcel: jest.fn((id) => {
        // TODO: use ID
        return data.user_parcel_template
      }),
      fetchLiveRates: jest.fn(),
    }

    const shippoFulfillmentService = new ShippoFulfillmentService({
      shippingProfileService,
      cartService,
      shippoClientService,
    })

    it("successfully fetched live rates for a cart", async () => {
      // expect(cartService.retrieve).toHaveBeenCalledWith()
    })
  })
})
