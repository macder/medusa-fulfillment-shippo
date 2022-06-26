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

    customer_id: isComplete && faker.database.mongodbObjectId(), // null
    company: isComplete && faker.company.companyName(), // null
    first_name: isComplete && faker.name.firstName(), // null
    last_name: isComplete && faker.name.lastName(), // null
    address_1: isComplete && faker.address.streetAddress(), // null
    address_2: isComplete && faker.address.secondaryAddress(), // null
    city: isComplete && faker.address.cityName(), // null
    province: isComplete && faker.address.stateAbbr(), // null
    postal_code: isComplete && faker.address.zipCode(), // null
    phone: isComplete && faker.phone.number(), // null

    metadata: null,
  }
}
