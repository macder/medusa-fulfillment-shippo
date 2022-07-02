import * as matchers from "jest-extended"
import { faker } from "@faker-js/faker"
import { MockRepository, MockManager, IdMap } from "medusa-test-utils"
import ShippoPackerService from "../../shippo-packer"
import ShippoClientService from "../../shippo-client"
import ShippoFulfillmentService from "../../shippo-fulfillment"
import {
  makeArrayOf,
  mockCart,
  mockCustomShippingOption,
  mockLineItemTotals,
  mockLiveRate,
  mockShippingOption,
  mockShippoBinPack,
  mockParcelTemplateResponse,
} from "../../__mocks__/data"

expect.extend(matchers)

describe("ShippoFulfillmentService", () => {
  describe("interface", () => {
    /** **************************
    
      getFulfillmentOptions
    
    ****************************/
    describe("getFulfillmentOptions", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const shippoClientService = new ShippoClientService({}, {})
      const shippoFulfilService = new ShippoFulfillmentService(
        { shippoClientService },
        {}
      )

      it("returned an array", async () => {
        const result = await shippoFulfilService.getFulfillmentOptions()
        expect(result).toBeArray()
      })

      it("returned array of object that have id and name properties", async () => {
        const result = await shippoFulfilService.getFulfillmentOptions()

        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
            }),
          ])
        )
      })
    })

    /** **************************
    
      validateFulfillmentData
    
    *****************************/
    describe("validateFulfillmentData", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const shippoClientService = new ShippoClientService({}, {})
      const shippoFulfilService = new ShippoFulfillmentService(
        { shippoClientService },
        {}
      )

      it("returned data object from param", async () => {
        const result = await shippoFulfilService.validateFulfillmentData(
          { test: "test" },
          { test: "test" },
          { test: "test" }
        )
        expect(result).toEqual({ test: "test" })
      })
    })

    /** **************************
    
      validateOption
    
    *****************************/
    describe("validateOption", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const shippoClientService = new ShippoClientService({}, {})
      const shippoFulfilService = new ShippoFulfillmentService(
        { shippoClientService },
        {}
      )

      it("returned true", async () => {
        const result = await shippoFulfilService.validateOption({
          test: "test",
        })
        expect(result).toEqual(true)
      })
    })

    /** **************************
    
      canCalculate
    
    *****************************/
    describe("canCalculate", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const shippoClientService = new ShippoClientService({}, {})
      const shippoFulfilService = new ShippoFulfillmentService({
        shippoClientService,
      })
      it("returns true when live-rate", async () => {
        expect(shippoFulfilService.canCalculate({ type: "LIVE_RATE" })).toBe(
          true
        )
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

    /** **************************
    
      calculatePrice
    
    *****************************/
    describe("calculatePrice", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      it("", () => {})
    })

    /** **************************
    
      createFulfillment
    
    *****************************/
    describe("createFulfillment", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      it("", () => {})
    })

    /** **************************
    
      cancelFulfillment
    
    *****************************/
    describe("cancelFulfillment", () => {
      beforeAll(async () => {
        jest.clearAllMocks()
      })

      const shippoClientService = new ShippoClientService({}, {})
      const shippoFulfilService = new ShippoFulfillmentService({
        shippoClientService,
      })

      it("returns resolved promise", async () => {
        expect.assertions(1)
        await expect(shippoFulfilService.cancelFulfillment()).resolves.toEqual(
          {}
        )
      })
    })
  })
})
