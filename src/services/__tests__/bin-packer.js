import { faker } from "@faker-js/faker"
import BinPackerService from "../bin-packer"

import {
  makeArrayOf,
  mockLineItem,
  mockParcelTemplate,
} from "../__mocks__/data"

describe("BinPackerClientService", () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  test("if bins_ property is declared", () => {
    const binPackerService = new BinPackerService({}, {})
    const result = binPackerService.bins_

    expect(Array.isArray(result)).toBe(true)
  })

  test("if items_ property is declared", () => {
    const binPackerService = new BinPackerService({}, {})
    const result = binPackerService.items_

    expect(Array.isArray(result)).toBe(true)
  })

  describe("setBins_", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const templateCount = faker.datatype.number({ min: 1, max: 6 })
    const parcelTemplates = makeArrayOf(mockParcelTemplate, templateCount)
    const binPackerService = new BinPackerService({}, {})
    binPackerService.setBins_(parcelTemplates)

    const result = binPackerService.bins_

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
    const binPackerService = new BinPackerService({}, {})
    binPackerService.setItems_(lineItems)

    const result = binPackerService.items_

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

    const binPackerService = new BinPackerService({}, {})

    // WIP
    it("", async () => {
      const result = await binPackerService.packBins(lineItems, parcelTemplates)
    })
  })
})
