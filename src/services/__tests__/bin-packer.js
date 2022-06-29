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

    // console.log("*********result: ", JSON.stringify(result, null, 2))

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

    // console.log("*********result: ", JSON.stringify(result, null, 2))

    it("sets bins_ property", () => {
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("packBins", () => {
    beforeAll(async () => {
      jest.clearAllMocks()
    })

    const itemCount = faker.datatype.number({ min: 3, max: 5 })
    const templateCount = faker.datatype.number({ min: 8, max: 10 })

    const parcelTemplates = makeArrayOf(mockParcelTemplate, templateCount)
    const lineItems = makeArrayOf(mockLineItem, itemCount)

    const binPackerService = new BinPackerService({}, {})
    const result = binPackerService.packBins(lineItems, parcelTemplates)

    // console.log('*********result: ', JSON.stringify(result, null, 2))
  })
})

// console.log('*********result: ', JSON.stringify(result, null, 2))

// console.log('*********result: ', result)
