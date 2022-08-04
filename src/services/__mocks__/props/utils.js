import { productTemplate, variantTemplate } from "../templates"

export const makeItemProps = (config, index) =>
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
