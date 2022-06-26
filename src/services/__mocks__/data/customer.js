import { faker } from "@faker-js/faker"

export const mockAddress = (isComplete = true) => ({
  id: `addr_${faker.database.mongodbObjectId()}`,
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
  phone: faker.phone.number(),
  metadata: null,
})
