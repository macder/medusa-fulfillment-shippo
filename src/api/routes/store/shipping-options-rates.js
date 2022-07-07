export default async (req, res, next) => {
  console.warn(
    "Shippo - POST request received at obsolete endpoint /store/shipping-options/:cart_id/shippo/rates. See README.md"
  )

  res.json({
    error:
      "Obsolete Endpoint: please use GET /store/shipping-options/:cart_id - see README.md",
  })
}
