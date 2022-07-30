import { productMock } from "./product"

const variant = (props) => (product) =>
  Object.freeze({
    id: props?.id ?? "variant_id_11",
    title: props?.title ?? "Variant Title",
    product_id: props?.product?.id ?? "prod_id_11",
    weight: 500,
    length: 10,
    height: 14,
    width: 10,
    product: product(),
  })

export const variantMock = (props) => variant(props)

export const variantProductMock = (props) =>
  variant(props)(() => productMock(props.product))
