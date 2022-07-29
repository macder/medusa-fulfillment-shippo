import { faker } from "@faker-js/faker"

const variant =
  (...[id, title]) =>
  (getProduct) =>
    Object.freeze({
      id,
      title,
      product_id: getProduct().id,
      weight: 500,
      length: 10,
      height: 14,
      width: 10,
      product: getProduct(),
    })

const product = (...[id, title, description]) =>
  Object.freeze({
    id,
    title,
    description,
    weight: 500,
    length: 10,
    height: 14,
    width: 10,
  })

const productParams = () => ({
  id: `prod_${faker.database.mongodbObjectId()}`,
  title: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
})

const variantParams = () => ({
  id: `variant_${faker.database.mongodbObjectId()}`,
  title: faker.commerce.productMaterial(),
})

export const mockProduct = ({ id, title, description }) =>
  product(id, title, description)

export const mockVariant = ({ id, title }) => variant(id, title)

export const mockVariantProduct = () =>
  mockVariant({ ...variantParams() })(() => mockProduct({ ...productParams() }))
