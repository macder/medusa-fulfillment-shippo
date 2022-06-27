import data from "./data/temp/shippo-data.json"

const shippo = () => ({
  carrieraccount: {
    list: jest.fn(async () => ({ results: [...data.carrier_accounts] })),
  },
  servicegroups: {
    list: jest.fn(async () => [...data.service_groups]),
  },
  liverates: {
    create: jest.fn(async (e) => e),
  },
})

export default shippo
