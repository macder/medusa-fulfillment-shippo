import { faker } from "@faker-js/faker"
import { makeArrayOfMocks } from "./data-utils"

const common = {
  reg_id: `reg_${faker.database.mongodbObjectId()}`,
  name: faker.address.country(),
  iso: faker.address.countryCode("alpha-3").toLowerCase(),
}

export const mockCountry = ({ region_id }) => ({
  id: faker.datatype.number(),
  iso_2: common.iso.slice(0, -1),
  iso_3: common.iso,
  num_code: faker.random.numeric(3),
  name: common.name.toUpperCase(),
  display_name: common.name,
  region_id,
})

export const mockRegion = ({ amountCountries }) => ({
  id: common.reg_id,
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
  countries: makeArrayOfMocks(mockCountry, amountCountries, {
    region_id: common.reg_id,
  }),
  payment_providers: [],
  tax_rates: [],
  fulfillment_providers: [],
})
