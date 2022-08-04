import {
  orderTemplate,
  itemTemplate,
  productTemplate,
  fulfillmentTemplate,
  fulfillmentItemTemplate,
  variantTemplate,
} from "./templates"

export const orderServiceMock = (config) => {
  const itemProps = (index) =>
    config(({ items, ...vals }) => ({
      ...vals,
      ...items[index],
      variant: variantTemplate({
        id: items[index].variant,
        product: productTemplate({
          id: items[index].product,
        }),
      }),
    }))

  const fulfillmentProps = (index) =>
    config(({ fulfillments, ...vals }) => ({
      ...vals,
      ...fulfillments[index],
      items: fulfillments[index].items.map((item) =>
        fulfillmentItemTemplate({
          ...item,
          fulfillment_id: fulfillments[index].id,
        })
      ),
    }))

  const orderProps = (id = null) =>
    config(({ ...vals }) => ({
      ...vals,
      id: vals.order_id,
      items: vals.items.map((item, index) => itemTemplate(itemProps(index))),
      fulfillments: vals.fulfillments.map((ful, index) =>
        fulfillmentTemplate(fulfillmentProps(index))
      ),
    }))

  return {
    list: jest.fn(async ({ display_id }) => [orderTemplate(orderProps())]),
    retrieve: jest.fn(async (id) => orderTemplate(orderProps(id))),
  }
}
