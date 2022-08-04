export const regionTemplate = ({ ...props }) =>
  Object.freeze({
    id: "reg_01G53M0DK23DEANP4VJX74AQZE",
    created_at: "2022-06-09T06:56:39.515Z",
    updated_at: "2022-07-07T17:05:17.246Z",
    deleted_at: null,
    name: "USA",
    currency_code: "usd",
    tax_rate: 10,
    tax_code: "HST123",
    gift_cards_taxable: true,
    automatic_taxes: true,
    tax_provider_id: null,
    metadata: null,
    countries: [
      {
        id: 236,
        iso_2: "us",
        iso_3: "usa",
        num_code: 840,
        name: "UNITED STATES",
        display_name: "United States",
        region_id: "reg_01G53M0DK23DEANP4VJX74AQZE",
      },
    ],
    payment_providers: [
      {
        id: "manual",
        is_installed: true,
      },
    ],
    tax_rates: [],
    fulfillment_providers: [
      {
        id: "shippo",
        is_installed: true,
      },
      {
        id: "manual",
        is_installed: true,
      },
    ],
  })
