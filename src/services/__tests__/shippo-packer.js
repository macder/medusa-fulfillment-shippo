import { faker } from "@faker-js/faker"
import ShippoPackerService from "../shippo-packer"

import {
  makeArrayOf,
  mockLineItem,
  mockParcelTemplate,
} from "../__mocks__/data"

describe("ShippoPackerService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  test("if bins_ property is declared", () => {
    const shippoPackerService = new ShippoPackerService({}, {})
    const result = shippoPackerService.bins_

    expect(Array.isArray(result)).toBe(true)
  })

  test("if items_ property is declared", () => {
    const shippoPackerService = new ShippoPackerService({}, {})
    const result = shippoPackerService.items_

    expect(Array.isArray(result)).toBe(true)
  })

  describe("setBins_", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const templateCount = faker.datatype.number({ min: 1, max: 6 })
    const parcelTemplates = makeArrayOf(mockParcelTemplate, templateCount)
    const shippoPackerService = new ShippoPackerService({}, {})
    shippoPackerService.setBins_(parcelTemplates)

    const result = shippoPackerService.bins_

    it("sets bins_ property", () => {
      expect(result.length).toBeGreaterThan(0)
    })

    describe("this.bins_", () => {
      test("length equals templates length", () => {
        expect(result.length).toBe(templateCount)
      })
    })
  })

  describe("setItems_", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const itemCount = faker.datatype.number({ min: 1, max: 4 })
    const lineItems = makeArrayOf(mockLineItem, itemCount)
    const shippoPackerService = new ShippoPackerService({}, {})
    shippoPackerService.setItems_(lineItems)

    const result = shippoPackerService.items_

    it("sets bins_ property", () => {
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("packBins", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const itemCount = faker.datatype.number({ min: 1, max: 3 })
    const templateCount = faker.datatype.number({ min: 11, max: 22 })

    const parcelTemplates = makeArrayOf(mockParcelTemplate, templateCount)
    const lineItems = makeArrayOf(mockLineItem, itemCount)

    const shippoPackerService = new ShippoPackerService({}, {})

    // WIP
    it("", async () => {
      const result = await shippoPackerService.packBins(
        lineItems,
        parcelTemplates
      )
    })
  })
})
