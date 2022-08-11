import { toBeNumber, toContainKey, toContainKeys } from "jest-extended"
import { cartMock, cartState } from "../__mocks__/cart"
import { orderMock, orderState } from "../__mocks__/order"
import { returnMock, returnState } from "../__mocks__/return"

import { makeShippoFulfillmentService } from "./setup"
import { shippoClientMock } from "../__mocks__"
import { shippoOrderState } from "../__mocks__/shippo/order"
import { userParcelState } from "../__mocks__/shippo/user-parcel"
import { liveRateState } from "../__mocks__/shippo/live-rate"
import { carrierAccountState } from "../__mocks__/shippo/carrier"
import { serviceGroupState } from "../__mocks__/shippo/service-group"
import { shippoTransactionState } from "../__mocks__/shippo/transaction"

import {
  fulfillmentOptionGroupSchema,
  fulfillmentOptionServiceSchema,
} from "../__mocks__/fulfillment-option"

expect.extend({ toBeNumber, toContainKey, toContainKeys })

const mockShippoClient = shippoClientMock({
  carriers: carrierAccountState(),
  live_rate: liveRateState(),
  order: shippoOrderState({ order_number: "11" }).has_return_label,
  service_groups: serviceGroupState(),
  user_parcels: userParcelState(),
  transaction: shippoTransactionState({ order_number: "11" }),
})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("ShippoFulfillmentService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  const fulfillmentOption = (type) =>
    ({
      group: fulfillmentOptionGroupSchema(),
      service: fulfillmentOptionServiceSchema(),
    }[type])

  const shippoFulfillmentService = makeShippoFulfillmentService({})

  describe("calculatePrice", () => {
    describe("cart is ready", () => {
      const shippoFulfillmentService = makeShippoFulfillmentService({
        ...cartState().has.items_address_email,
      })
      const cart = cartMock(cartState().has.items_address_email)(
        "cart_default_id"
      )

      test("returns number", async () => {
        const result = await shippoFulfillmentService.calculatePrice(
          fulfillmentOption("group"),
          {},
          cart
        )
        expect(result).toBeNumber()
      })
    })

    describe("cart not ready", () => {
      const shippoFulfillmentService = makeShippoFulfillmentService({
        ...cartState().has.items,
      })
      const cart = cartMock(cartState().has.items)("cart_default_id")

      test("returns null", async () => {
        const result = await shippoFulfillmentService.calculatePrice(
          fulfillmentOption("group"),
          {},
          cart
        )
        expect(result).toBeNull()
      })
    })
  })

  describe("canCalculate", () => {
    describe("live-rate option", () => {
      test("returns true", async () => {
        const result = await shippoFulfillmentService.canCalculate(
          fulfillmentOption("group")
        )
        expect(result).toBe(true)
      })
    })

    describe("service option", () => {
      test("returns false", async () => {
        const result = await shippoFulfillmentService.canCalculate(
          fulfillmentOption("service")
        )
        expect(result).toBe(false)
      })
    })
  })

  describe("cancelFulfillment", () => {
    test("", async () => {
      const result = await shippoFulfillmentService.cancelFulfillment()
      expect(result).toStrictEqual({})
    })
  })

  describe("createFulfillment", () => {
    const methodData = { parcel_template: "box" }
    const fulfillment = { order_id: "order_default" }
    const order = orderMock(orderState({ display_id: "11" }).default)(
      "order_default"
    )
    const fulfillmentItems = [...order.items]

    test("returns obj with order id", async () => {
      const result = await shippoFulfillmentService.createFulfillment(
        methodData,
        fulfillmentItems,
        order,
        fulfillment
      )
      expect(result).toContainKey("shippo_order_id")
    })
  })

  describe("createReturn", () => {
    describe("is claim", () => {
      const shippoFulfillmentService = makeShippoFulfillmentService({
        ...orderState({ display_id: "11" }).claim,
      })
      const returnOrder = returnMock(
        returnState({
          id: "ret_claim_replace",
          claim_order_id: "claim_replace",
        }).claim.replace
      )

      test("returns obj with rate", async () => {
        const result = await shippoFulfillmentService.createReturn(returnOrder)
        expect(result).toContainKey("rate")
      })
    })
  })

  describe("getFulfillmentOptions", () => {
    test("has required props", async () => {
      const result = await shippoFulfillmentService.getFulfillmentOptions()
      expect(result[0]).toContainKeys(["name", "object_id"])
    })
  })

  describe("validateFulfillmentData", () => {
    describe("is return", () => {
      const optionData = { is_return: true }
      test("only return data param", async () => {
        const result = await shippoFulfillmentService.validateFulfillmentData(
          optionData,
          { test: "testing" },
          {}
        )
        expect(result).toStrictEqual({ test: "testing" })
      })
    })

    describe("no cart", () => {
      const optionData = { is_return: false }
      test("only return data param", async () => {
        const result = await shippoFulfillmentService.validateFulfillmentData(
          optionData,
          { test: "testing" },
          {}
        )
        expect(result).toStrictEqual({ test: "testing" })
      })
    })

    describe("has complete cart", () => {
      const cart = cartMock(cartState().has.items_address_email)(
        "cart_default_id"
      )
      const optionData = { is_return: false }
      test("", async () => {
        const result = await shippoFulfillmentService.validateFulfillmentData(
          optionData,
          { test: "testing" },
          cart
        )
        expect(result).toContainKey("parcel_template")
        expect(result.parcel_template).toContainKeys(["id", "name"])
      })
    })
  })

  describe("validateOption", () => {
    test("returns true", async () => {
      const result = await shippoFulfillmentService.validateOption()
      expect(result).toBe(true)
    })
  })

  describe("verifyHookSecret", () => {
    test("returns true", async () => {
      const result = await shippoFulfillmentService.verifyHookSecret("secret")
      expect(result).toBe(true)
    })

    test("returns false", async () => {
      const result = await shippoFulfillmentService.verifyHookSecret(
        "wrong_secret"
      )
      expect(result).toBe(false)
    })

    test("returns false when empty string", async () => {
      const result = await shippoFulfillmentService.verifyHookSecret("")
      expect(result).toBe(false)
    })
  })
})
