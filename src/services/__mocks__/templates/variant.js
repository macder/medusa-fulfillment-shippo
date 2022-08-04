export const variantTemplate = ({ ...props }) =>
  Object.freeze({
    id: props?.id ?? "variant_id_11",
    title: props?.title ?? "Variant Title",
    product_id: props.product.id,
    weight: props.weight ?? 500,
    length: props.length ?? 10,
    height: props.height ?? 14,
    width: props.width ?? 10,
    product: props.product,
  })
