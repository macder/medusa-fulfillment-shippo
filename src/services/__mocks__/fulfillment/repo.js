import { MockRepository } from "medusa-test-utils"
import { fulfillmentMock } from "./mock"

export const fulfillmentRepoMock = (state) => {
  const query = (params) => {
    const select = Object.entries(params.where?.data ?? params.where).flat(1)
    return {
      key: select[0],
      value: select[1],
    }
  }

  return MockRepository({
    find: async (params) => {
      const selectBy = query(params)
    },
  })
}
