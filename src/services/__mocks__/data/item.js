import { variantProductMock } from "./variant"
import { makeArrayOf } from "./data-utils"

const lineItem = (props) => (variant) =>
  Object.freeze({
    id: props.get("id") ?? "item_11",
    cart_id: props.get("cart_id") ?? "cart_11",
    order_id: props.get("order_id"),
    swap_id: props.get("swap_id"),
    claim_order_id: props.get("claim_id"),
    title: props.get("variant")?.product?.title ?? "Product Title",
    description: props.get("variant")?.title ?? "Variant Title",
    variant_id: props.get("variant")?.id ?? "variant_id_11",
    unit_price: 10000,
    quantity: props.get("line_item")?.quantity ?? 1,
    variant: variant(props.get("variant")),
  })

export const lineItemMock = (props) => lineItem(props)(variantProductMock)

export const lineItemArrayMock = (propMap) =>
  makeArrayOf((i) => {
    const props = new Map(Object.entries(propMap.get("line_items")[i]))
    propMap.get("setIds")(propMap, props)
    return lineItemMock(props)
  }, propMap.get("line_items").length)
