import { MockManager } from "medusa-test-utils"
import ShippoService from "../../shippo"
import ShippoClientService from "../../shippo-client"
import ShippoOrderService from "../../shippo-order"
import ShippoPackageService from "../../shippo-package"
import ShippoPackerService from "../../shippo-packer"
import ShippoRatesService from "../../shippo-rates"
import ShippoTrackService from "../../shippo-track"
import ShippoTransactionService from "../../shippo-transaction"

import {
  cartServiceMock,
  fulfillmentServiceMock,
  fulfillmentRepoMock,
  lineItemServiceMock,
  orderServiceMock,
  shippingProfileServiceMock,
  totalsServiceMock,
  shippoClientMock,
} from "../../__mocks__"

const coreServiceMocks = (config) => (fn) =>
  fn({
    cartService: cartServiceMock(config),
    fulfillmentService: fulfillmentServiceMock(config),
    orderService: orderServiceMock(config),
    lineItemService: lineItemServiceMock(config),
    shippingProfileService: shippingProfileServiceMock(config),
    manager: MockManager,
    fulfillmentRepository: fulfillmentRepoMock(config),
    totalsService: totalsServiceMock(),
    pricingService: {
      setShippingOptionPrices: jest.fn(async (options) => options),
    },
  })

export const buildShippoServices = (config) =>  {
  const {
    cartService,
    fulfillmentService,
    orderService,
    lineItemService,
    shippingProfileService,
    fulfillmentRepository,
    manager,
    pricingService,
    totalsService,
  } = coreServiceMocks(config)((mocks) => mocks)

  const shippoClientService = new ShippoClientService(
    { fulfillmentService },
    {}
  )

  const shippoPackerService = new ShippoPackerService(
    { shippoClientService },
    {}
  )

  const shippoPackageService = new ShippoPackageService(
    { cartService, lineItemService, shippoClientService, shippoPackerService },
    {}
  )

  const shippoRatesService = new ShippoRatesService(
    {
      cartService,
      pricingService,
      shippingProfileService,
      shippoClientService,
      shippoPackageService,
      shippoPackerService,
      totalsService,
    },
    {}
  )

  const shippoTransactionService = new ShippoTransactionService(
    {
      fulfillmentService,
      shippoClientService,
      orderService,
    },
    {}
  )

  const shippoOrderService = new ShippoOrderService(
    {
      manager,
      fulfillmentService,
      fulfillmentRepository,
      shippoClientService,
      shippoTransactionService,
    },
    {}
  )

  const shippoTrackService = new ShippoTrackService(
    {
      fulfillmentService,
      shippoClientService,
      shippoOrderService,
      shippoTransactionService,
    },
    {}
  )

  const shippoService = new ShippoService(
    {
      shippoClientService,
      shippoOrderService,
      shippoPackageService,
      shippoPackerService,
      shippoRatesService,
      shippoTrackService,
      shippoTransactionService,
    },
    {}
  )

  return {
    shippoClientService,
    shippoPackerService,
    shippoPackageService,
    shippoRatesService,
    shippoTransactionService,
    shippoOrderService,
    shippoTrackService,
    shippoService
  }
   
}