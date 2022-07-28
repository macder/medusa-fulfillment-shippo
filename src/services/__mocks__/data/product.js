const variant =
  ({ variant_id: id, product_id, variant_title: title }) =>
  ({ product }) => ({
    id,
    title,
    product_id,
    weight: 500,
    length: 10,
    height: 14,
    width: 10,
    product,
  })

const product = ({ product_id: id, title, description }) => ({
  id,
  title,
  description,
  weight: 500,
  length: 10,
  height: 14,
  width: 10,
})

/**
 *
 * @param {Object} obj
 * @param {string} obj.variant_id -
 * @param {string} obj.product_id -
 * @param {string} obj.variant_title -
 * @param {string} obj.title -
 * @param {string} obj.description -
 */
export const mockVariantProduct = ({ ...params }) =>
  variant({
    ...params,
  })({
    product: product({
      ...params,
    }),
  })
