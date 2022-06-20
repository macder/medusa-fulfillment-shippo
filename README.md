## medusa-fulfillment-shippo

Adds Shippo as a fulfillment provider in Medusa Commerce.

Service level fulfillment options from active carriers in Shippo account, available when admin is creating shipping options for regions, profiles, etc.

Live shipping rates for carts at checkout, optimized with an equivalent first-fit-decreasing ([FFD](https://en.wikipedia.org/wiki/First-fit-decreasing_bin_packing)) bin packing algorithm.

Creates Shippo orders for new fulfillments.

Endpoints to retrieve Shippo orders and packaging slips using a Medusa fulfillment ID

## Table of Contents

*   [Getting Started](#getting-started)
*   [Rates at Checkout](#setup-rates-at-checkout)
    *   [Setup](#setup-rates-at-checkout)
        1.  [Setup Shipping Options in Shippo App](#step-1---setup-shipping-options-in-shippo-app)
        2.  [Assign the Shipping Options to Regions in Medusa](#step-2---assign-the-shipping-options-to-regions-in-medusa)
    *   [Usage](#using-rates-at-checkout)
        1.  [Get shipping rates for a cart](#get-shipping-rates-for-a-cart)
        2.  [Create shipping options with rates for cart](#create-shipping-options-with-rates-for-cart)
        3.  [Retrieve shipping options with rates for cart](#retrieve-shipping-options-with-rates-for-cart)
    *   [Optimizing](#optimizing-rates-at-checkout)
        1.  [How it works](#how-it-works)
        2.  [Setup parcel templates](#setup-parcel-templates)
        3.  [Verify product dimensions and weight](#verify-product-dimensions-and-weight)
        4.  [Accuracy of Rates](#accuracy-of-rates)
*   [Shippo Orders](#shippo-orders)
*   [Packaging Slip](#shippo-packaging-slip)
*   [Limitations](#limitations)
*   [Resources](#resources)

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

## Optimizing Rates at Checkout

Estimating shipping costs within reasonable accuracy for items in a cart is a challenging problem, to put it mildly. The classic [bin packing problem](https://en.wikipedia.org/wiki/Bin_packing_problem) is computationally [NP-hard](https://en.wikipedia.org/wiki/NP-hardness) with a [NP-complete](https://en.wikipedia.org/wiki/NP-completeness) decision. The good news is there are algorithms that solve this to varying degrees. The bad news is the ones with highly optimized results are resource heavy with complex implementations that are beyond the scope of this plugin. If you need highly optimized bin packing find a vendor. Currently, the public [Shippo API](https://goshippo.com/docs/reference) does not provide any bin packing solution. Shippo's live-rates API uses the carts total weight and the default or supplied parcel template, regardless if all items fit when calculating rates.

**But, this is not a dead-end…**

medusa-fulfillment-shippo uses [binpackingjs](https://github.com/olragon/binpackingjs) which provides a [first-fit](https://en.wikipedia.org/wiki/First-fit_bin_packing) algorithm. Additional logic is wrapped around it to get a more optimized [first-fit-decreasing](https://en.wikipedia.org/wiki/First-fit-decreasing_bin_packing) algorithm. In order for this to be effective, parcel templates need to be setup in the Shippo account, and all the products in medusa must have values for length, width, height, and weight.

### How it works

*   Sorts cart items from largest to smallest
    *   Attempt fitting sorted items one at a time into smallest parcel.
    *   If there are remaining items, tries fitting all sorted items one at a time into the next smallest parcel.
    *   If there are no remaining items, use this parcel for shipping rate.
    *   If all items cannot fit into single parcel, use the default template (_future versions might include multi parcel implementation_)

### Setup parcel templates

Create package templates in the [Shippo app settings](https://apps.goshippo.com/settings/packages)

To get most optimal results, it is recommended to create package templates for all your shipping boxes.

### Verify product dimensions and weight

In your medusa store, make sure products have correct values for length, width, height, weight

### Accuracy of Rates

Shipping rate estimates are calculated by third parties using data you supply. The onus is on the store admin to supply accurate data values about their products and packaging. This plugin does its best to use this data to create optimized requests, within reason and scope, to retrieve rates from Shippo. The intent is to provide a cost-cutting solution, but there is no one-size-fits all.

Assuming accurate data for product dimensions, weight, and package templates in shippo reflect a carefully planned boxing strategy, expect reasonably accurate rates for single item and multi-item fulfillment's that fit in a single parcel. Multi parcel for rates at checkout is currently not supported (future consideration). If items cannot fit into a single box, the default package template set in [Shippo app settings](https://apps.goshippo.com/settings/rates-at-checkout) is used.

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