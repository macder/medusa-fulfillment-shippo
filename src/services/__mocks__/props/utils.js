import { productTemplate, variantTemplate } from "../templates"

export const propWorker = (obj) => () => {
  const props = { ...obj }
  return {
    set: (key, value) => propWorker({ ...props, [key]: value })(),
    push: (key, value) =>
      Array.isArray(props[key])
        ? propWorker({ ...obj, [key]: [...props[key], value] })()
        : propWorker(props)(),
    filter: (arrayKey, [key, value]) =>
      Array.isArray(props[arrayKey])
        ? propWorker({
            ...props,
            [arrayKey]: props[arrayKey].filter(
              (member) => member[key] === value
            ),
          })()
        : propWorker({ ...props })(),
    release: () => ({ ...props }),
  }
}

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
