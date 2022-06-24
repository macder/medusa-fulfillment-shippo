import { MockRepository, MockManager, IdMap } from "medusa-test-utils"
import ShippoFulfillmentService from "../shippo-fulfillment"

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
    getLineItemTotals: jest.fn(),
    create: jest.fn(),
  }

  const shippoFulfillmentService = new ShippoFulfillmentService({
    manager: MockManager,
    cartService,
    customShippingOptionService,
    customShippingOptionRepository,
    shippingProfileService,
    totalsService,
  })

  beforeAll(async () => {
    jest.clearAllMocks()
  })

  it("successfully create a fulfillment", async () => {
    const shippo = {
      fetchCustomParcel: jest.fn(),
    }
    await shippoFulfillmentService.createFulfillment(
      {
        shipping_methods: [
          {
            shipping_option: {
              profile_id: IdMap.getId("default"),
              provider_id: "GLS Express",
            },
          },
        ],
        items: [{ id: IdMap.getId("test-line"), quantity: 10 }],
      },
      [
        {
          item_id: IdMap.getId("test-line"),
          quantity: 10,
        },
      ],
      {
        order_id: "test",
        metadata: {
          shippo_parcel_template: IdMap.getId("test-line"),
        },
      }
    )

    // expect(fulfillmentRepository.create).toHaveBeenCalledWith({
    //   order_id: "test",
    //   provider_id: "",
    //   items: [{ item_id: IdMap.getId("test-line"), quantity: 10 }],
    //   data: expect.anything(),
    //   metadata: {},
    // })
  })
})
