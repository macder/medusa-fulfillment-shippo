import { MockManager } from "medusa-test-utils"
import path from "path"
import ShippoService from "../../shippo"
import ShippoClientService from "../../shippo-client"
import ShippoFulfillmentService from "../../shippo-fulfillment"
import ShippoOrderService from "../../shippo-order"
import ShippoPackageService from "../../shippo-package"
import ShippoPackerService from "../../shippo-packer"
import ShippoRatesService from "../../shippo-rates"
import ShippoTrackService from "../../shippo-track"
import ShippoTransactionService from "../../shippo-transaction"

import { default as helpers } from "../../../helpers"

import { cartServiceMock } from "../../__mocks__/cart"
import {
  fulfillmentServiceMock,
  fulfillmentRepoMock,
} from "../../__mocks__/fulfillment"
import { lineItemServiceMock } from "../../__mocks__/line-item"
import { orderServiceMock } from "../../__mocks__/order"
import { totalsServiceMock } from "../../__mocks__/totals"
import { shippingProfileServiceMock } from "../../__mocks__/shipping"

const coreServiceMocks = (state) => ({
  cartService: cartServiceMock(state),
  fulfillmentService: fulfillmentServiceMock(state),
  orderService: orderServiceMock(state),
  lineItemService: lineItemServiceMock(state),
  shippingProfileService: shippingProfileServiceMock(state),
  manager: MockManager,
  fulfillmentRepository: fulfillmentRepoMock(state),
  totalsService: totalsServiceMock(),
  pricingService: {
    setShippingOptionPrices: jest.fn(async (options) => options),
  },
  logger: {
    error: jest.fn(async (msg) => console.error(msg)),
    warn: jest.fn(async (msg) => console.warn(msg)),
  },
  eventBusService: {
    emit: jest.fn(),
  },
})

export const makeShippoHelper = (state) => helpers(coreServiceMocks(state))

export const makeShippoClientService = (state) => {
  const { fulfillmentService } = coreServiceMocks(state)

  return new ShippoClientService({ fulfillmentService }, {})
}

export const makeShippoPackerService = (state) => {
  const shippoClientService = makeShippoClientService(state)
  return new ShippoPackerService({ shippoClientService }, {})
}

export const makeShippoPackageService = (state) => {
  const { cartService, fulfillmentService, lineItemService, orderService } =
    coreServiceMocks(state)

  const shippoClientService = makeShippoClientService(state)
  const shippoPackerService = makeShippoPackerService(state)

  return new ShippoPackageService(
    {
      cartService,
      fulfillmentService,
      lineItemService,
      orderService,
      shippoClientService,
      shippoPackerService,
    },
    {}
  )
}

export const makeShippoRatesService = (state) => {
  const {
    cartService,
    fulfillmentService,
    logger,
    pricingService,
    shippingProfileService,
    totalsService,
  } = coreServiceMocks(state)

  const shippoClientService = makeShippoClientService(state)
  const shippoPackerService = makeShippoPackerService(state)
  const shippoPackageService = makeShippoPackageService(state)

  return new ShippoRatesService(
    {
      cartService,
      logger,
      pricingService,
      shippingProfileService,
      shippoClientService,
      shippoPackageService,
      shippoPackerService,
      totalsService,
    },
    {}
  )
}

export const makeShippoTransactionService = (state) => {
  const { fulfillmentService, orderService, logger } = coreServiceMocks(state)
  const shippoClientService = makeShippoClientService(state)
  const shippoTransactionService = new ShippoTransactionService(
    {
      fulfillmentService,
      logger,
      shippoClientService,
      orderService,
    },
    {}
  )

  return shippoTransactionService
}

export const makeShippoOrderService = (state) => {
  const { fulfillmentService, fulfillmentRepository, manager } =
    coreServiceMocks(state)

  const shippoClientService = makeShippoClientService(state)
  const shippoTransactionService = makeShippoTransactionService(state)
  const shippoOrderService = new ShippoOrderService(
    {
      manager,
      fulfillmentService,
      fulfillmentRepository,
      shippoClientService,
      shippoTransactionService,
      // shippoHelper,
    },
    {}
  )

  return shippoOrderService
}

export const makeShippoTrackService = (state) => {
  const { fulfillmentService } = coreServiceMocks(state)
  const shippoClientService = makeShippoClientService(state)
  const shippoOrderService = makeShippoOrderService(state)
  const shippoTransactionService = makeShippoTransactionService(state)

  return new ShippoTrackService(
    {
      fulfillmentService,
      shippoClientService,
      shippoOrderService,
      shippoTransactionService,
    },
    {}
  )
}

export const makeShippoFulfillmentService = (state) => {
  const {
    eventBusService,
    fulfillmentService,
    logger,
    orderService,
    totalsService,
  } = coreServiceMocks(state)

  const shippoClientService = makeShippoClientService(state)
  const shippoPackageService = makeShippoPackageService(state)
  const shippoRatesService = makeShippoRatesService(state)
  const shippoTransactionService = makeShippoTransactionService(state)

  return new ShippoFulfillmentService(
    {
      eventBusService,
      logger,
      orderService,
      totalsService,
      shippoClientService,
      shippoPackageService,
      shippoRatesService,
      shippoTransactionService,
    },
    {}
  )
}

export const makeShippoService = (state) => {
  const { fulfillmentService } = coreServiceMocks(state)
  const shippoClientService = makeShippoClientService(state)
  const shippoOrderService = makeShippoOrderService(state)
  const shippoPackerService = makeShippoPackerService(state)
  const shippoPackageService = makeShippoPackageService(state)
  const shippoRatesService = makeShippoRatesService(state)
  const shippoTrackService = makeShippoTrackService(state)
  const shippoTransactionService = makeShippoTransactionService(state)

  return new ShippoService(
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
}
