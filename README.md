# medusa-fulfillment-shippo

Adds [Shippo](https://goshippo.com/) as a fulfillment provider in [Medusa](https://medusajs.com/)

Medusa is an open-source headless commerce engine that enables developers to create amazing digital commerce experiences.

**Still in dev phase. Expect an npm release soon**

## Current Feature Overview
- Carrier service level fulfillment options
- Service group fulfillment options
- Rates at checkout
- Fulfillments create new Shippo order
## Getting started
WIP

## Feature Details

### Fulfilment Options
Adds Fulfilment option for each service level provided by active carriers in your Shippo account. These will be available when an admin is creating shipping options for regions, profiles, etc.

### Service Groups
WIP

### Rates at Checkout
A new endpoint is exposed at `/shippo/rates/[:cart_id]` that will create custom shipping options based on the available shipping options for the cart via the core `CustomShippingOptionService`

Use this endpoint once you have a delivery address in the checkout flow.

Sample response
```
{
    "customShippingOptions": [
        {
            "price": 2022,
            "shipping_option_id": "so_01G5B8SM0ASZGEMQXGD9Q7NA7A",
            "cart_id": "cart_01G5BM36YGRSJQWXGF2SSKB40V",
            "metadata": {},
            "id": "cso_01G5BM55KB6437SX6D82YVNR2J",
            "deleted_at": null,
            "created_at": "2022-06-12T09:33:10.635Z",
            "updated_at": "2022-06-12T09:33:10.635Z"
        },
        {
            "price": 3972,
            "shipping_option_id": "so_01G58VQAQCM8JRMR4FW01DSSH4",
            "cart_id": "cart_01G5BM36YGRSJQWXGF2SSKB40V",
            "metadata": {},
            "id": "cso_01G5BM55KDFNYTX2D0YP43RPAZ",
            "deleted_at": null,
            "created_at": "2022-06-12T09:33:10.635Z",
            "updated_at": "2022-06-12T09:33:10.635Z"
        }
    ]
}
```

Then when you query `/store/shipping-options/[:cart_id]` they will the rated prices

### Create Shippo Order
A new Shippo order is created when an admin creates a fulfilment. The shipping method and its price at checkout is attached to the Shippo order.

## Planned Features
- Returns
- Customs for international orders
- Swaps (exchanges)

## Resources
Medusa Docs
https://docs.medusajs.com/

Medusa Shipping Architecture:
https://docs.medusajs.com/advanced/backend/shipping/overview

Shippo API
https://goshippo.com/docs/intro
https://goshippo.com/docs/reference
