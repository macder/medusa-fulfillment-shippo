import { fulfillmentTemplate, fulfillmentItemTemplate } from "./templates"

export const fulfillmentServiceMock = (config) => {
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

  return {
    list: jest.fn(),
    retrieve: jest.fn((id) => fulfillmentTemplate(fulfillmentProps(id))),
  }
}
