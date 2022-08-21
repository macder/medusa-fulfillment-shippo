import { toBeNumber, toContainKey, toContainKeys } from "jest-extended"
import { cartStub } from "../__mocks__/cart"
import { orderStub } from "../__mocks__/order"
import { fulfillmentState } from "../__mocks__/fulfillment"
import { returnStub, returnState } from "../__mocks__/return"

import {
  makeShippoHelper,
  makeShippoFulfillmentService,
  makeShippoService,
} from "./setup"
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
import { lineItemState, lineItemStub } from "../__mocks__/line-item"
import { addressState } from "../__mocks__/address"

expect.extend({ toBeNumber, toContainKey, toContainKeys })

const mockShippoClient = shippoClientMock({
  carriers: carrierAccountState,
  live_rate: liveRateState,
  order: shippoOrderState,
  service_groups: serviceGroupState,
  user_parcels: userParcelState,
  transaction: shippoTransactionState,
})

jest.mock("@macder/shippo", () => () => mockShippoClient)

describe("ShippoFulfillmentService", () => {
  const defaultIds = () => ({
    order_id: "order_default",
    display_id: "11",
    cart_id: "cart_default_id",
    claim_order_id: null,
    swap_id: null,
  })

  const fulfillmentOption = (type) =>
    ({
      group: fulfillmentOptionGroupSchema(),
      service: fulfillmentOptionServiceSchema(),
    }[type])

  describe("calculatePrice", () => {
    describe("cart is ready", () => {
      test("returns number", async () => {
        // arrange
        const state = {
          ...defaultIds(),
          cart_id: "cart_has_address_items_email",
          line_items: [
            lineItemState({ quantity: 1 }),
            lineItemState({ quantity: 2 }),
          ],
          fulfillments: [],
          email: "test@test.com",
          address: addressState("complete"),
        }

        const shippoFulfillmentService = makeShippoFulfillmentService(state)
        makeShippoHelper(state)

        const cart = cartStub({ ...state })

        // act
        const result = await shippoFulfillmentService.calculatePrice(
          fulfillmentOption("group"),
          {},
          cart
        )
        expect(result).toBeNumber()
      })
    })

    describe("cart not ready", () => {
      test("returns null", async () => {
        // arrange
        const state = {
          ...defaultIds(),
          cart_id: "cart_has_no_address_no_items_no_email",
          line_items: [],
          fulfillments: [],
          address: addressState("empty"),
        }
        const shippoFulfillmentService = makeShippoFulfillmentService(state)
        makeShippoHelper(state)

        const cart = cartStub({ ...state })

        // act
        const result = await shippoFulfillmentService.calculatePrice(
          fulfillmentOption("group"),
          {},
          cart
        )

        // assert
        expect(result).toBeNull()
      })
    })
  })

  describe("canCalculate", () => {
    describe("live-rate option", () => {
      test("returns true", async () => {
        // arrange
        const shippoFulfillmentService = makeShippoFulfillmentService({})
        makeShippoHelper({})

        // act
        const result = await shippoFulfillmentService.canCalculate(
          fulfillmentOption("group")
        )

        // assert
        expect(result).toBe(true)
      })
    })

    describe("service option", () => {
      test("returns false", async () => {
        // arrange
        const shippoFulfillmentService = makeShippoFulfillmentService({})
        makeShippoHelper({})
        // act
        const result = await shippoFulfillmentService.canCalculate(
          fulfillmentOption("service")
        )

        // assert
        expect(result).toBe(false)
      })
    })
  })

  describe("cancelFulfillment", () => {
    test("", async () => {
      // arrange
      const shippoFulfillmentService = makeShippoFulfillmentService({})
      makeShippoHelper({})

      // act
      const result = await shippoFulfillmentService.cancelFulfillment()

      // assert
      expect(result).toStrictEqual({})
    })
  })

  describe("createFulfillment", () => {
    test("returns obj with order id", async () => {
      // arrange
      const state = {
        ...defaultIds(),
        line_items: [
          lineItemState({ quantity: 1 }),
          lineItemState({ quantity: 2 }),
        ],
        fulfillments: [],
      }
      const methodData = { parcel_template: "box" }
      const fulfillment = { order_id: "order_default" }
      const order = orderStub({ ...state })
      const fulfillmentItems = state.line_items.map((item) =>
        lineItemStub({ ...item })
      )
      const shippoFulfillmentService = makeShippoFulfillmentService(state)
      makeShippoHelper(state)

      // act
      const result = await shippoFulfillmentService.createFulfillment(
        methodData,
        fulfillmentItems,
        order,
        fulfillment
      )

      // assert
      expect(result).toContainKey("shippo_order_id")
    })
  })

  describe("createReturn", () => {
    describe("is claim", () => {
      test("returns obj with rate", async () => {
        // arrange
        const state = {
          ...defaultIds(),
          display_id: "22",
          line_items: [
            lineItemState({ quantity: 1 }),
            lineItemState({ quantity: 2 }),
          ],
          fulfillments: [
            fulfillmentState("has_transaction_for_label_with_return"),
          ],
        }
        const shippoFulfillmentService = makeShippoFulfillmentService(state)
        makeShippoHelper(state)

        const returnOrder = returnStub(
          returnState({
            id: "ret_claim_replace",
            claim_order_id: "claim_replace",
          }).claim.replace
        )

        // act
        const result = await shippoFulfillmentService.createReturn(returnOrder)

        // assert
        expect(result).toContainKey("rate")
      })
    })
  })

  describe("getFulfillmentOptions", () => {
    test("has required props", async () => {
      // arrange
      const shippoFulfillmentService = makeShippoFulfillmentService({})
      makeShippoHelper({})

      // act
      const result = await shippoFulfillmentService.getFulfillmentOptions()

      // assert
      expect(result[0]).toContainKeys(["name", "object_id"])
    })
  })

  describe("validateFulfillmentData", () => {
    describe("is return", () => {
      test("only return data param", async () => {
        // arrange
        const shippoFulfillmentService = makeShippoFulfillmentService({})
        makeShippoHelper({})
        const optionData = { is_return: true }

        // act
        const result = await shippoFulfillmentService.validateFulfillmentData(
          optionData,
          { test: "testing" },
          {}
        )

        // asserta
        expect(result).toStrictEqual({ test: "testing" })
      })
    })

    describe("no cart", () => {
      test("only return data param", async () => {
        // arrange
        const shippoFulfillmentService = makeShippoFulfillmentService({})
        makeShippoHelper({})

        const optionData = { is_return: false }

        // act
        const result = await shippoFulfillmentService.validateFulfillmentData(
          optionData,
          { test: "testing" },
          {}
        )

        // assert
        expect(result).toStrictEqual({ test: "testing" })
      })
    })

    describe("has complete cart", () => {
      test("", async () => {
        // arrange
        const state = {
          ...defaultIds(),
          cart_id: "cart_has_address_items_email",
          line_items: [
            lineItemState({ quantity: 1 }),
            lineItemState({ quantity: 2 }),
          ],
          fulfillments: [],
          email: "test@test.com",
          address: addressState("complete"),
        }
        const shippoFulfillmentService = makeShippoFulfillmentService({})
        makeShippoHelper({})
        const cart = cartStub({ ...state })
        const optionData = { is_return: false }

        // act
        const result = await shippoFulfillmentService.validateFulfillmentData(
          optionData,
          { test: "testing" },
          cart
        )

        // assert
        expect(result).toContainKey("parcel_template")
      })
    })
  })

  describe("validateOption", () => {
    test("returns true", async () => {
      // arrange
      const shippoFulfillmentService = makeShippoFulfillmentService({})
      makeShippoHelper({})

      // act
      const result = await shippoFulfillmentService.validateOption()

      // assert
      expect(result).toBe(true)
    })
  })

  describe("verifyHookSecret", () => {
    let shippoFulfillmentService

    beforeEach(() => {
      const state = {}
      shippoFulfillmentService = makeShippoFulfillmentService({})
      makeShippoHelper({})
    })

    test("returns true", async () => {
      // act
      const result = await shippoFulfillmentService.verifyHookSecret("secret")

      // assert
      expect(result).toBe(true)
    })

    test("returns false", async () => {
      // act
      const result = await shippoFulfillmentService.verifyHookSecret(
        "wrong_secret"
      )

      // assert
      expect(result).toBe(false)
    })

    test("returns false when empty string", async () => {
      // act
      const result = await shippoFulfillmentService.verifyHookSecret("")

      // assert
      expect(result).toBe(false)
    })
  })
})
