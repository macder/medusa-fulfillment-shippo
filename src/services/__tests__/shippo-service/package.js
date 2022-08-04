import * as matchers from "jest-extended"
import { buildShippoServices } from "../setup"
import { shippoClientMock } from "../../__mocks__"
import { itemTemplate } from "../../__mocks__/templates"
import {
  defaults as defaultProps,
  userParcelProps,
  makeItemProps,
} from "../../__mocks__/props"

expect.extend(matchers)

const propConfig = (fn) =>
  fn({
    ...defaultProps((vals) => ({
      ...vals,
      ...userParcelProps(),
    })),
  })

const mockShippoClient = shippoClientMock(propConfig)

jest.mock("shippo", () => () => mockShippoClient)

describe("shippoService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })
  describe("package", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const { shippoService } = buildShippoServices(propConfig)

    describe("for", () => {
      describe("local_order", () => {
        it("returns packer output", async () => {
          const result = await shippoService.package
            .for(["local_order", "order_01234567890"])
            .fetch()
          expect(result).toBeArray()
          expect(result[0]).toContainKey("packer_output")
        })
      })

      describe("cart", () => {
        it("returns packer output", async () => {
          const result = await shippoService.package
            .for(["cart", "cart_01234567890"])
            .fetch()
          expect(result).toBeArray()
          expect(result[0]).toContainKey("packer_output")
        })
      })

      describe("line_items", () => {
        const lineItems = propConfig(({ items }) => items).map((item, i) =>
          itemTemplate(makeItemProps(propConfig, i))
        )

        it("returns packer output", async () => {
          const result = await shippoService.package
            .for(["line_items", lineItems])
            .fetch()
          expect(result).toBeArray()
          expect(result[0]).toContainKey("packer_output")
        })
      })

      describe("fulfillment", () => {
        it("returns packer output", async () => {
          const result = await shippoService.package
            .for(["fulfillment", "ful_01234567890"])
            .fetch()

          expect(result).toBeArray()
          expect(result[0]).toContainKey("packer_output")
        })
      })
    })
  })
})
