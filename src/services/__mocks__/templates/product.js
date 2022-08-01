export const productTemplate = ({ ...props }) =>
  Object.freeze({
    id: props?.id ?? "product_id_11",
    title: "Product Title",
    description: "Product Description",
    weight: props.weight ?? 500,
    length: props.length ?? 10,
    height: props.height ?? 14,
    width: props.width ?? 10,
  })
