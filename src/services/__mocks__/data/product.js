const product = (props) =>
  Object.freeze({
    id: props?.id ?? "prod_id_11",
    title: props?.title ?? "Product Title",
    description: props?.description ?? "Product Description",
    weight: props.weight ?? 500,
    length: props.length ?? 10,
    height: props.height ?? 14,
    width: props.width ?? 10,
  })

export const productMock = (props) => product(props)
