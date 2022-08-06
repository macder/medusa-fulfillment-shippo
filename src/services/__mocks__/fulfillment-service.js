import { fulfillmentTemplate, fulfillmentItemTemplate } from "./templates"

export const fulfillmentServiceMock = (config) => {
  
  // Legacy
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

  // New implementation - waiting for other WIP
  // const fulfillments = fulfillmentTemplate({
  //   ...props,
  //   items: props.items.map((item) => fulfillmentItemTemplate(item)),
  // })

  return {
    list: jest.fn(),
    retrieve: jest.fn(async (id) => fulfillmentTemplate(fulfillmentProps(id))),
  }
}
