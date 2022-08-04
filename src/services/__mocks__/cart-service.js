import {
  addressTemplate,
  cartTemplate,
  itemTemplate,
  productTemplate,
  variantTemplate,
} from "./templates"

export const cartServiceMock = (config) => {
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

  const cartProps = (id) =>
    config(({ ...vals }) => ({
      ...vals,
      id,
      items: vals.items.map((item, index) => itemTemplate(itemProps(index))),
      address: vals.shipping_address ? addressTemplate({}) : null,
    }))

  return {
    list: jest.fn(),
    retrieve: jest.fn(async (id) => cartTemplate(cartProps(id))),
  }
}
