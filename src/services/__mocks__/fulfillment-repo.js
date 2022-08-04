import { MockRepository } from "medusa-test-utils"
import { fulfillmentTemplate, fulfillmentItemTemplate } from "./templates"
import { propWorker } from "./props"

export const fulfillmentRepoMock = (config) => {
  const fulfillmentProps = (props, index) => {
    const fulfillment = props.fulfillments[index]
    return {
      ...props,
      ...fulfillment,
      items: fulfillment.items.map((item) =>
        fulfillmentItemTemplate({
          ...item,
          fulfillment_id: fulfillment.id,
        })
      ),
    }
  }

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
      const props = config(propWorker)()
        .filter("fulfillments", [selectBy.key, selectBy.value])
        .release()

      return props.fulfillments.map((ful, index) =>
        fulfillmentTemplate(fulfillmentProps(props, index))
      )
    },
  })
}
