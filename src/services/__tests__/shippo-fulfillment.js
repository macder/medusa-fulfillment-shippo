import { MockRepository, MockManager, IdMap } from "medusa-test-utils"
import ShippoFulfillmentService from "../shippo-fulfillment"
import data from "../__data__/creatFulfillment.json"

describe("ShippoFulfillmentService", () => {
  const customShippingOptionRepository = MockRepository({
    find: (q) => {
      return Promise.resolve([
        {
          id: "cso-test",
          shipping_option_id: "test-so",
          price: 0,
          cart_id: "test-cso-cart",
        },
      ])
    },
  })

  const cartService = {
    setMetadata: jest.fn(),
    retrieve: jest.fn(),
  }

  const customShippingOptionService = {
    list: jest.fn(),
    create: jest.fn(),
  }

  const shippingProfileService = {
    fetchCartOptions: jest.fn(),
  }

  const totalsService = {
    getLineItemTotals: jest.fn(async (item, order) => data.line_item_totals),
    create: jest.fn(),
  }

  const shippoClientService = {
    getClient: jest.fn(),
    composeFulfillmentOptions_: jest.fn(),
    fetchCarriers_: jest.fn(),
    fetchServiceGroups_: jest.fn(),
    fetchCarrierParcelTemplate: jest.fn(),

    fetchCustomParcel: jest.fn((id) => {
      // TODO: use ID
      return data.user_parcel_template
    }),

    fetchLiveRates: jest.fn(),
    findActiveCarriers_: jest.fn(),
    splitCarriersToServices_: jest.fn(),
    createOrder: jest.fn(async (order) => {
      return {
        object_id: 'd65f4gd654gf',
      }
    }),
  }

  const shippoFulfillmentService = new ShippoFulfillmentService({
    manager: MockManager,
    cartService,
    customShippingOptionService,
    customShippingOptionRepository,
    shippingProfileService,
    totalsService,
    shippoClientService,
  })

  beforeAll(async () => {
    jest.clearAllMocks()
  })

  it("successfully created a shippo order", async () => {
    const createFulfillment = await shippoFulfillmentService.createFulfillment(
      {},
      data.fulfillmentItems,
      data.fromOrder,
      {}
    )

    expect(shippoClientService.fetchCustomParcel).toHaveBeenCalledWith(data.fromOrder.metadata.shippo_parcel_template)

    expect(createFulfillment).toEqual({
      shippo_order_id: 'd65f4gd654gf',
      shippo_parcel_template: data.fromOrder.metadata.shippo_parcel_template,
    })
  })
})
