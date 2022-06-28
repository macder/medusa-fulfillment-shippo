import { faker } from "@faker-js/faker"
import { makeArrayOf } from "./data-utils"

/** Mock Country Codes
 * @return {object}
 */
export const mockCountryCodes = () => {
  const iso = faker.address.countryCode("alpha-3").toLowerCase()
  return {
    iso_2: iso.slice(0, -1),
    iso_3: iso,
    num_code: faker.random.numeric(3),
  }
}

/** Mock Country
 * @param {object} state
 * @param {int} [state.region_id]
 * @return {object}
 */
export const mockCountry = ({ region_id = null }) => {
  const name = faker.address.country()
  return {
    id: faker.datatype.number(),
    ...mockCountryCodes(),
    name: name.toUpperCase(),
    display_name: name,
    region_id,
  }
}

/** Mock Region
 * @param {object} state
 * @param {int} state.countries - amount of countries to generate
 * @return {object}
 */
export const mockRegion = ({ countries }) => {
  const reg_id = `reg_${faker.database.mongodbObjectId()}`
  return {
    id: reg_id,
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    deleted_at: null,
    name: faker.word.noun(),
    currency_code: faker.finance.currencyCode().toLowerCase(),
    tax_rate: 0,
    tax_code: null,
    gift_cards_taxable: true,
    automatic_taxes: true,
    tax_provider_id: null,
    metadata: null,
    countries: makeArrayOf(mockCountry, countries, {
      region_id: reg_id,
    }),
    payment_providers: [],
    tax_rates: [],
    fulfillment_providers: [],
  }
}
