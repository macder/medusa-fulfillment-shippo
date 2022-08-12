import { MockRepository } from "medusa-test-utils"
import { fulfillmentMock } from "./mock"

export const fulfillmentRepoMock = ({ ...state }) =>
  MockRepository({
    find: async (params) =>
      state.fulfillments.map((ful) => fulfillmentMock(ful)),
  })
