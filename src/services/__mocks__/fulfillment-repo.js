import { MockRepository } from "medusa-test-utils"
import { fulfillmentTemplate, fulfillmentItemTemplate } from "./templates"

export const fulfillmentRepoMock = (config) => {
  const fulfillments = config((props) => props.fulfillments)

  const fulfillmentProps = (id) =>
    config(({ fulfillments, ...vals }) => {
      const fulfillment = fulfillments.find((ful) => ful.id === id)
      return {
        ...vals,
        ...fulfillment,
        items: fulfillment.items.map((item) =>
          fulfillmentItemTemplate({
            ...item,
            fulfillment_id: fulfillment.id,
          })
        ),
      }
    })

  return MockRepository({
    find: async (config) =>
      fulfillments.map((ful) => fulfillmentTemplate(fulfillmentProps(ful.id))),
  })
}
