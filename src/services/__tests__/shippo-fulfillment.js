import { toBeNumber, toContainKey, toContainKeys } from "jest-extended"
import { cartMock, cartState } from "../__mocks__/cart"

import { makeShippoFulfillmentService } from "./setup"
import { shippoClientMock } from "../__mocks__"
import { userParcelState } from "../__mocks__/shippo/user-parcel"
import { liveRateState } from "../__mocks__/shippo/live-rate"
import { carrierAccountState } from "../__mocks__/shippo/carrier"
import { serviceGroupState } from "../__mocks__/shippo/service-group"

import {
  fulfillmentOptionGroupSchema,
  fulfillmentOptionServiceSchema,
} from "../__mocks__/fulfillment-option"

expect.extend({ toBeNumber, toContainKey, toContainKeys })

const mockShippoClient = shippoClientMock({
  carriers: carrierAccountState(),
  live_rate: liveRateState(),
  service_groups: serviceGroupState(),
  user_parcels: userParcelState(),
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
    const shippoFulfillmentService = makeShippoFulfillmentService({})

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
    const shippoFulfillmentService = makeShippoFulfillmentService({})

    test("", async () => {
      const result = await shippoFulfillmentService.cancelFulfillment()
      expect(result).toStrictEqual({})
    })
  })

  describe("createFulfillment", () => {
    test("", async () => {
      // const result = await shippoFulfillmentService
      // expect(result)
    })
  })

  describe("createReturn", () => {
    test("", async () => {
      // const result = await shippoFulfillmentService
      // expect(result)
    })
  })

  describe("getFulfillmentOptions", () => {
    const shippoFulfillmentService = makeShippoFulfillmentService({})
    test("has required props", async () => {
      const result = await shippoFulfillmentService.getFulfillmentOptions()
      expect(result[0]).toContainKeys(["name", "object_id"])
    })
  })

  describe("validateFulfillmentData", () => {
    const shippoFulfillmentService = makeShippoFulfillmentService({})

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
    test("", async () => {
      // const result = await shippoFulfillmentService
      // expect(result)
    })
  })

  describe("verifyHookSecret", () => {
    test("", async () => {
      // const result = await shippoFulfillmentService
      // expect(result)
    })
  })
})
