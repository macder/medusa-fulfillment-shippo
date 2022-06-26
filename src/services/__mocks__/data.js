import { faker } from "@faker-js/faker"

export const makeArrayOf = (mockFn, count) =>
  [...Array(count).keys()].map((e) => mockFn())

export const mockAddress = () => ({
  id: faker.database.mongodbObjectId(),
  created_at: faker.date.past(),
  updated_at: faker.date.past(),
  deleted_at: null,
  customer_id: faker.database.mongodbObjectId(),
  company: faker.company.companyName(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  address_1: faker.address.streetAddress(),
  address_2: faker.address.secondaryAddress(),
  city: faker.address.cityName(),
  country_code: faker.address.countryCode().toLowerCase(),
  province: faker.address.stateAbbr(),
  postal_code: faker.address.zipCode(),
  phone: faker.phone.phoneNumber(),
  metadata: null,
})

export const mockParcelTemplate = () => ({
  object_id: faker.database.mongodbObjectId(),
  object_owner: faker.internet.email(),
  object_created: faker.date.past(),
  object_updated: faker.date.past(),
  name: faker.random.words(4),
  length: faker.datatype.number({ min: 20, max: 100 }),
  width: faker.datatype.number({ min: 20, max: 100 }),
  height: faker.datatype.number({ min: 20, max: 100 }),
  distance_unit: "cm",
  weight: faker.datatype.number({ min: 200, max: 3000 }),
  weight_unit: "g",
})
