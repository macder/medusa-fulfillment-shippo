import { MockRepository } from "medusa-test-utils"
import { fulfillmentMock } from "./mock"

export const fulfillmentRepoMock = ({ ...state }) =>
  MockRepository({
    find: async (params) =>
      state.fulfillments.map(({ items, shippo_order_id, id, tracking_links }) =>
        fulfillmentMock({ ...state, shippo_order_id })(items, tracking_links)(
          id
        )
      ),
  })
