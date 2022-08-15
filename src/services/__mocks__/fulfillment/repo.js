import { MockRepository } from "medusa-test-utils"
import { fulfillmentStub } from "./stub"

export const fulfillmentRepoMock = ({ ...state }) =>
  MockRepository({
    find: async (params) =>
      state.fulfillments.map((ful) => fulfillmentStub({ ...state, ...ful })),
  })
