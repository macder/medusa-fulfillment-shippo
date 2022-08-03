import * as matchers from "jest-extended"
import { buildShippoServices } from "./setup"
import { shippoClientMock } from "../__mocks__"
import { defaults as defaultProps, userParcelProps } from "../__mocks__/props"

expect.extend(matchers)

const propConfig = (fn) => fn({
  ...defaultProps((vals) => ({
    ...vals,
    ...userParcelProps()
  }))
})

const mockShippoClient = shippoClientMock(propConfig)

jest.mock("shippo", () => () => mockShippoClient)

describe("shippoService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  /* ===================================================== */
  describe("account", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoService = buildShippoServices(propConfig).shippoService

    it("returns default address", async () => {
      const result = await shippoService.account.address()
      expect(result).toContainEntry(["is_default_sender", true])
    })
  })
  /* ===================================================== */

  /* ===================================================== */
  describe("order", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoService = buildShippoServices(propConfig).shippoService

    describe("fetch", () => {
      describe("id", () => {
        test("returns", async () => {
          const id = "object_id_order_123"
          const result = await shippoService.order.fetch(id)
          expect(result).toContainEntry(["object_id", id])
        })
      })
    })

    describe("fetchBy", () => {
      describe("fulfillment", () => {
        test("returns", async () => {
          const id = "ful_01234567890"
          const result = await shippoService.order.fetchBy(["fulfillment", id])
          expect(result).toContainEntry([
            "object_id",
            "shippo_order_01234567890",
          ])
        })
      })

      describe("local_order", () => {
        test("returns", async () => {
          const id = "order_01234567890"
          const result = await shippoService.order.fetchBy(["local_order", id])
          expect(result).toBeArray()
          expect(result[0]).toContainEntry([
            "object_id",
            "shippo_order_01234567890",
          ])
        })
      })

      // TODO
      describe("claim", () => {})

      // TODO
      describe("swap", () => {})
    })

    describe("with", () => {
      describe("fulfillment", () => {
        describe("fetch", () => {
          test("returns with correct object_id", async () => {
            const id = "shippo_order_01234567890"
            const result = await shippoService.order
              .with(["fulfillment"])
              .fetch(id)

            expect(result).toContainEntry(["object_id", id])
          })

          test("returns with prop.fulfillment", async () => {
            const id = "shippo_order_01234567890"
            const result = await shippoService.order
              .with(["fulfillment"])
              .fetch(id)
            expect(result).toContainKey("fulfillment")
          })

          test("returns with fulfillment", async () => {
            const id = "shippo_order_01234567890"
            const result = await shippoService.order
              .with(["fulfillment"])
              .fetch(id)
            expect(result.fulfillment).toContainEntry(["id", "ful_01234567890"])
          })
        })
      })
    })

    describe("is", () => {
      describe("type", () => {
        describe("replace", () => {
          it("returns false", async () => {
            const id = "shippo_order_01234567890"
            const result = await shippoService
              .is(["order", id], "replace")
              .fetch()
            expect(result).toBeFalse()
          })
          it("returns true", async () => {
            // const id = "object_id_order_replace_123"
            // const result = await shippoService
            //   .is(["order", id], "replace")
            //   .fetch()
            // expect(result).toBeTrue()
          })
        })
      })
    })
  })
  /* ===================================================== */

  /* ===================================================== */
  describe("package", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const shippoService = buildShippoServices(propConfig).shippoService

    describe("for", () => {
      describe("cart", () => {
        it("returns packer output", async () => {
          const result = await shippoService.package
            .for(["cart", "cart_01234567890"])
            .fetch()
          expect(result).toBeArray()
          expect(result[0]).toContainKey("packer_output")
        })
      })
    })

  })
  /* ===================================================== */
})

// console.log('*********result: ', JSON.stringify(result, null, 2))
