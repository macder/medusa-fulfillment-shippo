import { Validator as v } from "medusa-core-utils"

v.shippingAddress = () => {
  return v.object().keys({
    id: v.string().required(),
    created_at: v.date().required(),
    updated_at: v.date().allow(null, "").optional(),
    deleted_at: v.date().allow(null, "").optional(),
    customer_id: v.string().allow(null, "").optional(),
    first_name: v.string().required(),
    last_name: v.string().required(),
    company: v.string()
      .allow(null, "")
      .optional(),
    address_1: v.string().required(),
    address_2: v.string()
      .allow(null, "")
      .optional(),
    city: v.string().required(),
    country_code: v.string().required(),
    province: v.string().required(),
    postal_code: v.string().required(),
    phone: v.string().optional(),
    metadata: v.object()
      .allow(null, {})
      .optional(),
  })
}

export { v as Validator }
