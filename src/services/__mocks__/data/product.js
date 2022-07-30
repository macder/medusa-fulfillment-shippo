const product = (props) =>
  Object.freeze({
    id: props?.id ?? "prod_id_11",
    title: props?.title ?? "Product Title",
    description: props?.description ?? "Product Description",
    weight: 500,
    length: 10,
    height: 14,
    width: 10,
  })

export const productMock = (props) => product(props)
