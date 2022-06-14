## medusa-fulfillment-shippo

**Still in dev phase. Expect an npm release soon**

[Shippo](https://goshippo.com/) fulfillment provider for [Medusa](https://medusajs.com/)

## Current Feature Overview

*   Carrier service level fulfillment options
*   Service group fulfillment options
*   Rates at checkout
*   Fulfillment's create new Shippo order

## Getting started

*   WIP

## Feature Details

### Fulfillment Options

Adds Fulfillment option for each service level provided by active carriers in your Shippo account. These will be available when an admin is creating shipping options for regions, profiles, etc.

### Rates at Checkout

Live shipping rates for carts at checkout

There are some preliminary setup steps before using this feature. Follow [the guide](#setup-rates-at-checkout) to get started:

### Create Shippo Order

A new Shippo order is created when an admin creates a fulfillment. The shipping method and its price at checkout is attached to the Shippo order.

## Planned Features

*   Returns
*   Customs for international orders
*   Swaps (exchanges)

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

> **NOTE:** If using [Medusa Admin](https://github.com/medusajs/admin) there is a [bug](https://github.com/medusajs/admin/issues/597) that prevents creating \`price\_type: calculated\` shipping options for regions. Use the admin API directly as a workaround (instructions below) or [look here](https://github.com/medusajs/admin/issues/597) and ye shall figure it out…

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
GET http://localhost:9000/admin/shipping-profile
```

Get the `NAME` and `DATA` fields of the Shippo option created in Step 1: ([API ref](https://docs.medusajs.com/api/admin/shipping-option/list-shipping-options))

```plaintext
GET http://localhost:9000/admin/shipping-options?region_id=[:region_id]
```

Create the shipping option for the region using the data fields collected from previous steps: ([API ref](https://docs.medusajs.com/api/admin/shipping-option/create-shipping-option))

```plaintext
POST http://localhost:9000/admin/shipping-options
--data {
  "name": "Express Shipping",
  "data": [DATA],
  "region_id": "[REGION_ID]",
  "profile_id": "[PROFILE_ID]",
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
GET http://localhost:9000/shippo/live-rates/:cart_id
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
POST GET http://localhost:9000/shippo/live-rates/
--data {"cart_id":"CART_ID"}
```

Creates custom shipping options with the rates for the cart based on its available shipping options.

These are created using the core [CustomShippingOptionService](https://docs.medusajs.com/references/services/classes/CustomShippingOptionService)

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

## Resources

Medusa Docs  
https://docs.medusajs.com/

Medusa Shipping Architecture:  
https://docs.medusajs.com/advanced/backend/shipping/overview

Shippo API  
https://goshippo.com/docs/intro  
https://goshippo.com/docs/reference
