## medusa-fulfillment-shippo

Adds Shippo as a fulfillment provider in Medusa Commerce.

Adds a fulfillment option for each service level provided by active carriers in your Shippo account. These will be available when an admin is creating shipping options for regions, profiles, etc.

Live shipping rates for carts at checkout.

New fulfillments create orders in Shippo.

Endpoints to retrieve Shippo orders and packaging slips using a Medusa fulfillment ID

## Getting started

Install:

`> npm i medusa-fulfillment-shippo`

Add to medusa-config.js

```plaintext
{
  resolve: `medusa-fulfillment-shippo`,
    options: {
      api_key: SHIPPO_API_KEY,
      weight_unit: 'g', // valid values: g, kg, lb, oz
      dimension_unit_type: 'cm' // valid values: cm, mm, in
    },
}
```

## Setup Rates at Checkout

### Step 1 - Setup Shipping Options in Shippo App

Lets assume shipping from Canada to customers in Canada and USA via “Standard” and “Express” options

This would require setting up 4 shipping options in Shippo ([https://apps.goshippo.com/settings/rates-at-checkout](https://apps.goshippo.com/settings/rates-at-checkout))

1.  Standard Shipping Canada
2.  Express Shipping Canada
3.  Standard Shipping USA
4.  Express Shiping USA

Set each shipping option to “Live rate” and assign _service(s)_ to them

For example:

*   Express Shipping Canada: _Canada Post XpressPost_
*   Express Shipping USA: _Canada Post XpressPost USA_
*   _…_

For more in-depth details see [https://support.goshippo.com/hc/en-us/articles/4403207559963](https://support.goshippo.com/hc/en-us/articles/4403207559963)

### **Step 2 - Assign the Shipping Options to Regions in Medusa**

> **NOTE:** If using [Medusa Admin](https://github.com/medusajs/admin) there is a [bug](https://github.com/medusajs/admin/issues/597) that prevents creating \`price\_type: calculated\` shipping options for regions. The workaround is to either set the price to 0 (easy way) or use the admin API directly (hard way) (instructions below)

The manual way:

Get the `REGION_ID` of the region to use: ([API ref](https://docs.medusajs.com/api/admin/region/list-regions))

```plaintext
GET http://localhost:9000/admin/regions
```

Add Shippo as a fulfillment provider to a region ([API ref](https://docs.medusajs.com/api/admin/region/add-fulfillment-provider))

```plaintext
POST http://localhost:9000/admin/regions/:region_id/fulfillment-providers
--data '{"provider_id":"shippo"}'
```

Get the `PROFILE_ID` of the shipping profile to use: ([API ref](https://docs.medusajs.com/api/admin/shipping-profile/list-shipping-profiles))

```plaintext
GET http://localhost:9000/admin/shipping-profiles
```

Get the fulfillment options for the region ([API ref](https://docs.medusajs.com/api/admin/region/list-fulfillment-options-available-in-the-region))

```plaintext
GET http://localhost:9000/admin/regions/:REGION_ID/fulfillment-options
```

In the response, find the `FULFILLMENT_OPTION_OBJECT` 

```plaintext
{
  "id": "shippo-fulfillment-...",
  "is_group": true,
  "description": "2 days",
  "flat_rate": "25",
  "flat_rate_currency": "CAD",
  "free_shipping_threshold_currency": null,
  "free_shipping_threshold_min": null,
  "is_active": true,
  "name": "Express Shipping Canada",
  "object_id": "...",
  "rate_adjustment": 0,
  "service_levels": [
    {
      "account_object_id": "...",
      "service_level_token": "canada_post_xpresspost"
    }
  ],
  "type": "LIVE_RATE"
}
```

Create the shipping option for the region. ([API ref](https://docs.medusajs.com/api/admin/shipping-option/create-shipping-option))

```plaintext
POST http://localhost:9000/admin/shipping-options
--data {
  "name": "DISPLAY NAME",
  "data": [FULFILLMENT_OPTION_OBJECT],
  "region_id": [:REGION_ID],
  "profile_id": [:PROFILE_ID],
  "requirements": [],
  "price_type": "calculated",
  "amount": null,
  "is_return": false,
  "provider_id": "shippo",
  "admin_only": false
}
```

Repeat above steps for each shipping option.

## Using Rates at Checkout

### **Get shipping rates for a cart**

```plaintext
GET http://localhost:9000/store/shippo/live-rates/:cart_id
```

Returns an array of Shippo live-rate objects that match the carts shipping options.

The cart must have a complete shipping address or the response will be a validation error.

Sample response:

```plaintext
[
  {
    "title": "Express Shipping Canada",
    "description": "2 days",
    "amount": "26.37",
    "currency": "CAD",
    "amount_local": "26.37",
    "currency_local": "CAD",
    "estimated_days": 1
  }
]
```

### **Create shipping options with rates for cart:**

```plaintext
POST http://localhost:9000/store/shippo/live-rates/
--data {"cart_id":"CART_ID"}
```

Creates custom shipping options with the rates for the cart based on its available shipping options.

These are created using the core [CustomShippingOptionService](https://docs.medusajs.com/references/services/classes/CustomShippingOptionService)

Query this endpoint in the checkout flow when the shipping address becomes available.

Sample response:

```plaintext
{
  "customShippingOptions": [
    {
      "price": 2637,
      "shipping_option_id": "SHIPPING_OPTION_ID",
      "cart_id": "CART_ID",
      "metadata": {
        "is_shippo_rate": true,
        "title": "Express Shipping Canada",
        "description": "",
        "amount": "26.37",
        "currency": "CAD",
        "amount_local": "26.37",
        "currency_local": "CAD",
        "estimated_days": 1
      },
      "id": "ID",
      "deleted_at": null,
      "created_at": "2022-06-14T02:58:02.368Z",
      "updated_at": "2022-06-14T02:58:02.368Z"
    }
  ]
}
```

### **Retrieve shipping options with rates for cart**

After creating the custom shipping options in the previous step, they are available via the standard [store/shipping-options](https://docs.medusajs.com/api/store/shipping-option/retrieve-shipping-options-for-cart) endpoint

```plaintext
GET http://localhost:9000/store/shipping-options/:cart_id
```

## Shippo Orders

Creating an order fulfillment in admin will create an order in Shippo.

View the orders at [https://apps.goshippo.com/orders](https://apps.goshippo.com/orders)

A new endpoint is exposed that will retrieve a Shippo order for the fulfillment

```plaintext
GET http://localhost:9000/admin/shippo/order/:fulfillment_id
```

Returns `shippo_order` object

Note: The `to_address`, `from_address`, and `object_owner`  fields are scrubbed and replaced with their `object_id`

## Shippo Packaging Slip

Retrieve shippo package slip using medusa fulfillment id:

```plaintext
GET http://localhost:9000/admin/shippo/order/:fulfillment_id/packingslip
```

## Limitations

Currently this plugin does not support returns/exchanges, customs declarations, webhooks.

These are currently under development for future releases.

## Resources

Medusa Docs  
https://docs.medusajs.com/

Medusa Shipping Architecture:  
https://docs.medusajs.com/advanced/backend/shipping/overview

Shippo API  
https://goshippo.com/docs/intro  
https://goshippo.com/docs/reference