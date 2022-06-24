# medusa-fulfillment-shippo

Adds Shippo as a fulfillment provider in Medusa Commerce.

Service level fulfillment options from active carriers in Shippo account, available when admin is creating shipping options for regions, profiles, etc.

Live shipping rates for carts at checkout, optimized with a [first-fit-decreasing (FFD)](https://en.wikipedia.org/wiki/First-fit-decreasing_bin_packing) bin packing algorithm.

Creates Shippo orders for new fulfillments.

Retrieves Shippo orders and packing slips for fulfillments 

## Table of Contents

*   [Getting Started](#getting-started)
*   [Rates at Checkout](#rates-at-checkout)
    *   Setup
        1.  [Setup Shipping Options in Shippo App](#step-1---setup-shipping-options-in-shippo-app)
        2.  [Assign the Shipping Options to Regions in Medusa](#step-2---assign-the-shipping-options-to-regions-in-medusa)
    *   [Usage](#using-rates-at-checkout)
        1.  [Get rates for cart](#get-rates-for-cart)
        2.  [Set rates for cart](#set-rates-for-cart)
        3.  [Retrieve shipping options with rates for cart](#retrieve-shipping-options-with-rates-for-cart)
    *   [Optimizing](#optimizing-rates-at-checkout)
        1.  [How it works](#how-it-works)
        2.  [Setup parcel templates](#setup-parcel-templates)
        3.  [Verify product dimensions and weight](#verify-product-dimensions-and-weight)
        4.  [Accuracy of Rates](#accuracy-of-rates)
*   [Orders](#orders)
*   [Packing Slip](#packing-slip)
*   [Shippo Node Client](#shippo-node-client)
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
      weight_unit_type: 'g', // valid values: g, kg, lb, oz
      dimension_unit_type: 'cm' // valid values: cm, mm, in
    },
}
```

## Rates at Checkout

Provide customers with accurate shipping rates at checkout to reduce over and under charges. This plugin implements a first-fit-decreasing bin packing algorithm to choose an appropriate parcel for the items in a cart. Follow this guide to get setup and then optimize.

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
GET /admin/regions
```

Add Shippo as a fulfillment provider to a region ([API ref](https://docs.medusajs.com/api/admin/region/add-fulfillment-provider))

```plaintext
POST /admin/regions/:id/fulfillment-providers
--data '{"provider_id":"shippo"}'
```

Get the `PROFILE_ID` of the shipping profile to use: ([API ref](https://docs.medusajs.com/api/admin/shipping-profile/list-shipping-profiles))

```plaintext
GET /admin/shipping-profiles
```

Get the fulfillment options for the region ([API ref](https://docs.medusajs.com/api/admin/region/list-fulfillment-options-available-in-the-region))

```plaintext
GET /admin/regions/:id/fulfillment-options
```

In the response, find the `FULFILLMENT_OPTION_OBJECT` 

```plaintext
{
  "id": "shippo-fulfillment-...",
  "is_group": true,
  "description": "2 days",
  "flat_rate": "25",
  "flat_rate_currency": "USD",
  "free_shipping_threshold_currency": null,
  "free_shipping_threshold_min": null,
  "is_active": true,
  "name": "Express Shipping USA",
  "object_id": "...",
  "rate_adjustment": 0,
  "service_levels": [
    {
      "account_object_id": "...",
      "service_level_token": "canada_post_xpresspost_usa"
    }
  ],
  "type": "LIVE_RATE"
}
```

Create the shipping option for the region. ([API ref](https://docs.medusajs.com/api/admin/shipping-option/create-shipping-option))

```plaintext
POST /admin/shipping-options
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

### **Get rates for cart**

Request rates for all “live-rate” shipping options available to the cart. Returns an array of shippo live-rate objects. Does NOT modify the cart or shipping options. Useful if you just need flat data for UI

The cart must have a complete shipping address

**HTTP:**

```plaintext
GET /store/carts/:id/shippo/rates
```

**Service:**

```javascript
await shippoFulfillmentService.fetchLiveRates(cart_id)
```

Sample response:

```plaintext
[
  {
    "title": "Express Shipping USA",
    "description": "",
    "amount": "32.56",
    "currency": "CAD",
    "amount_local": "25.04",
    "currency_local": "USD",
    "estimated_days": 1
  }
]
```

### **Set rates for cart:**

Update the price of any “live-rate” shipping option available to the cart. This will use the carts shipping options as templates to create new or update existing custom shipping options via [CustomShippingOptionService](https://docs.medusajs.com/references/services/classes/CustomShippingOptionService). They will become available when requesting a carts shipping options. Useful right before it's time to show the customer their shipping options, i.e during checkout after submitting a shipping address.

> Note: This may change in the future. Currently the interfaced [calculatePrice](https://github.com/medusajs/medusa/blob/6c1a722b38da294355ceba659360fbe52d07558f/packages/medusa-interfaces/src/fulfillment-service.js#L59) method for fullfillmentService is invoked after the user adds a shipping method to their cart, a bit too late for the show... hence the use of CustomShippingOptionService at this time.

**HTTP:**

```plaintext
POST /store/shipping-options/:cart_id/shippo/rates/
```

**Service:**

```javascript
await shippoFulfillmentService.updateShippingRates(cart_id)
```

Sample response:

```plaintext
{
  "customShippingOptions": [
    {
      "price": 2504,
      "shipping_option_id": "SHIPPING_OPTION_ID",
      "cart_id": "CART_ID",
      "metadata": {
        "is_shippo_rate": true,
        "title": "Express Shipping USA",
        "description": "",
        "amount": "32.56",
        "currency": "CAD",
        "amount_local": "25.04",
        "currency_local": "USD",
        "estimated_days": 1
      },
      "id": "CSO_ID",

    }
  ]
}
```

### **Retrieve shipping options with rates for cart**

After creating the custom shipping options in the previous step, they are available via the standard [store/shipping-options](https://docs.medusajs.com/api/store/shipping-option/retrieve-shipping-options-for-cart) endpoint

**HTTP:**

```plaintext
GET /store/shipping-options/:cart_id
```

**Service:**

```javascript
const cart = await cartService.retrieve(cart_id, {
  select: ["subtotal"],
  relations: ["region", "items", "items.variant", "items.variant.product"],
})

await shippingProfileService.fetchCartOptions(cart)
```

## Optimizing Rates at Checkout

Estimating an accurate shipping cost for a cart with multiple items of various dimensions is a challenging problem. The classic [bin packing problem](https://en.wikipedia.org/wiki/Bin_packing_problem) is computationally [NP-hard](https://en.wikipedia.org/wiki/NP-hardness) with a [NP-complete](https://en.wikipedia.org/wiki/NP-completeness) decision. The good news is there are algorithms that solve this to varying degrees. The bad news is the ones with highly optimized results are resource heavy with complex implementations that are beyond the scope of this plugin. If you need highly optimized bin packing find a vendor. Currently, the public [Shippo API](https://goshippo.com/docs/reference) does not provide any bin packing solution. Shippo's live-rates API uses the carts total weight and the default or supplied parcel template, regardless if all items fit when calculating rates.

**But, this is not a dead-end…**

medusa-fulfillment-shippo uses [binpackingjs](https://github.com/olragon/binpackingjs) which provides a [first-fit](https://en.wikipedia.org/wiki/First-fit_bin_packing) algorithm. Additional logic is wrapped around it to get a more optimized [first-fit-decreasing](https://en.wikipedia.org/wiki/First-fit-decreasing_bin_packing) algorithm. In order for this to be effective, parcel templates need to be setup in the Shippo account, and all products in medusa must have values for length, width, height, and weight.

### How it works

*   Sorts parcels from smallest to largest
*   Sorts items from largest to smallest
    *   Attempts fitting items into smallest parcel the largest item can fit.
    *   If there are items remaining, try the next parcel size
    *   If there are no remaining items, use this parcel for shipping rate.
    *   If all items cannot fit into single parcel, use the default template (_future implementation planned - this is because not all carriers in shippo support single orders with multi parcels_)

### Setup parcel templates

Create package templates in the [Shippo app settings](https://apps.goshippo.com/settings/packages)

To get most optimal results, it is recommended to create package templates for all your shipping boxes.

### Verify product dimensions and weight

In your medusa store, make sure products have correct values for length, width, height, weight

### Accuracy of Rates

Shipping rate estimates are calculated by third parties using data you supply. The onus is on the store admin to supply accurate data values about their products and packaging. This plugin does its best to use this data to create optimized requests, within reason and scope, to retrieve rates from Shippo. The intent is to provide a cost-cutting solution, but there is no one-size-fits all.

Assuming accurate data for product dimensions, weight, and package templates in shippo reflect a carefully planned boxing strategy, expect reasonably accurate rates for single item and multi-item fulfillment's that fit in a single parcel. Multi parcel for rates at checkout is currently not supported (future consideration). If items cannot fit into a single box, the default package template set in [Shippo app settings](https://apps.goshippo.com/settings/rates-at-checkout) is used.

## Orders

Creating an order fulfillment in admin will create an order in Shippo.

View the orders at [https://apps.goshippo.com/orders](https://apps.goshippo.com/orders)

Retrieve Shippo order for a fulfillment

**HTTP:**

```plaintext
GET /admin/fulfillments/:id/shippo/order
```

**Service:**

```javascript
const { data: { shippo_order_id } } = await fulfillmentService.retrieve(fulfillment_id)
const client = shippoFulfillmentService.useClient

await client.order.retrieve(shippo_order_id)
```

Returns `shippo_order` object

## Packing Slips

Retrieve Shippo packing slip for a fulfillment

**HTTP:**

```plaintext
GET /admin/fulfillments/:id/shippo/packingslip
```

**Service:**

```javascript
const { data: { shippo_order_id } } = await fulfillmentService.retrieve(fulfillment_id)
const client = shippoFulfillmentService.useClient

await client.order.packingslip(shippo_order_id)
```

## Shippo Node Client

This plugin is using a forked version of the official shippo-node-client. 

The fork adds support for the following endpoints:

*   live-rates
*   service-groups
*   user-parcel-templates
*   orders/:id/packingslip

The client is exposed on the `useClient` property

```javascript
const client = shippoFulfillmentService.useClient

// Forks additional methods
await client.liverates.create({...parms})
await client.userparceltemplates.list()
await client.userparceltemplates.retrieve(id)
await client.servicegroups.list()
await client.servicegroups.create({...params})
...
```

See [Shippo API Reference](https://goshippo.com/docs/reference) for methods

[Official client](https://github.com/goshippo/shippo-node-client)

[Forked client](https://github.com/macder/shippo-node-client/tree/medusa)

## Limitations

Currently, this plugin does not support returns/exchanges, customs declarations, webhooks.

These are currently under development for future releases.

## Resources

Medusa Docs  
https://docs.medusajs.com/

Medusa Shipping Architecture:  
https://docs.medusajs.com/advanced/backend/shipping/overview

Shippo API  
https://goshippo.com/docs/intro  
https://goshippo.com/docs/reference