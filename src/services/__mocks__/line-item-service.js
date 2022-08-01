import { itemTemplate, productTemplate, variantTemplate } from "./templates"

export const lineItemServiceMock = (config) => {
  const itemProps = (id) =>
    config(({ items, ...vals }) => {
      const item = items.find((itm) => itm.id === id)
      return {
        ...vals,
        ...item,
        variant: variantTemplate({
          id: item.variant,
          product: productTemplate({
            id: item.product,
          }),
        }),
      }
    })

  return {
    list: jest.fn(),
    retrieve: jest.fn((id) => itemTemplate(itemProps(id))),
  }
}
