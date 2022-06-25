import data from "../__mocks__/shippo-data.json"

const shippo = () => ({
  carrieraccount: {
    list: jest.fn(
      async () => ({ results: [...data.carrier_accounts] })
    )
  },
  servicegroups: {
    list: jest.fn(
      async () => ([ ...data.service_groups ])
    )
  }
})

export default shippo