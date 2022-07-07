import { faker } from "@faker-js/faker"
import { makeArrayOf } from "./data-utils"
import { mockParcelTemplate } from "./shippo-api"

// WIP
export const mockPackerItem = () => {
  const dim = {
    weight: faker.datatype.number({ min: 200, max: 3000 }),
    length: faker.datatype.number({ min: 20, max: 100 }),
    width: faker.datatype.number({ min: 20, max: 100 }),
    height: faker.datatype.number({ min: 20, max: 100 }),
  }
  const volume = dim.length * dim.width * dim.height

  return {
    title: faker.commerce.productName(),
    product_id: `prod_${faker.database.mongodbObjectId()}`,
    variant_id: `variant_${faker.database.mongodbObjectId()}`,
    length: dim.length,
    width: dim.width,
    height: dim.height,
    weight: dim.weight,
    volume: volume,
    locus: {
      allowed_rotation: [0, 1, 2, 3, 4, 5],
      rotation_type: 0,
      position: [0, 0, 0],
    },
  }
}

// WIP
export const mockPackerOutput = () => {
  return {
    volume: {},
    items: makeArrayOf(mockPackerItem, 1),
  }
}

// WIP
export const mockShippoBinPack = () => {
  const parcelTemplate = makeArrayOf(mockParcelTemplate, 2)

  return {
    ...parcelTemplate,
    packer_output: mockPackerOutput(),
  }
}
