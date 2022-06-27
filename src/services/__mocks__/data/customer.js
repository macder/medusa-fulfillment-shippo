import { faker } from "@faker-js/faker"

/** Mock Address
 * @param {bool} [isComplete=true]
 * @return {object}
 */
export const mockAddress = (isComplete = true) => {
  isComplete = isComplete === true || null

  return {
    id: `addr_${faker.database.mongodbObjectId()}`,
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    deleted_at: null,
    country_code: faker.address.countryCode().toLowerCase(),

    customer_id: isComplete && faker.database.mongodbObjectId(),
    company: isComplete && faker.company.companyName(),
    first_name: isComplete && faker.name.firstName(),
    last_name: isComplete && faker.name.lastName(),
    address_1: isComplete && faker.address.streetAddress(),
    address_2: isComplete && faker.address.secondaryAddress(),
    city: isComplete && faker.address.cityName(),
    province: isComplete && faker.address.stateAbbr(),
    postal_code: isComplete && faker.address.zipCode(),
    phone: isComplete && faker.phone.number(),

    metadata: null,
  }
}
