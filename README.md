# medusa-fulfillment-shippo

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/macder/medusa-fulfillment-shippo/tree/main.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/macder/medusa-fulfillment-shippo/tree/main)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/5ca5e600f1574354a8056441f589ca80)](https://www.codacy.com/gh/macder/medusa-fulfillment-shippo/dashboard?utm_source=github.com\&utm_medium=referral\&utm_content=macder/medusa-fulfillment-shippo\&utm_campaign=Badge_Grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/5ca5e600f1574354a8056441f589ca80)](https://www.codacy.com/gh/macder/medusa-fulfillment-shippo/dashboard?utm_source=github.com\&utm_medium=referral\&utm_content=macder/medusa-fulfillment-shippo\&utm_campaign=Badge_Coverage)

> :information\_source: Requires Medusa 1.3.3^

Shippo fulfillment provider for Medusa Commerce.

Service level fulfillment options from active carriers in Shippo account, available when admin is creating shipping options for regions, profiles, etc.

Rates at checkout, optimized with a [first-fit-decreasing (FFD)](https://en.wikipedia.org/wiki/First-fit-decreasing_bin_packing) bin packing algorithm.

Fulfillments create an order in shippo

Retrieves Shippo orders and packing slips for fulfillments

## Table of Contents

*   [Getting Started](#getting-started)
*   [Rates at Checkout](#rates-at-checkout)
    *   [Setup](#rates-at-checkout)
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
    *   [Parcel Packer](#parcel-packer)
*   [Orders](#orders)
*   [Packing Slip](#packing-slip)
*   [Webhooks](#webhooks)
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
      dimension_unit_type: 'cm', // valid values: cm, mm, in
      webhook_secret: '' // README section on webhooks before using!
    },
}
```

## Rates at Checkout

Provide customers with accurate shipping rates at checkout to reduce over and under charges. This plugin implements a first-fit-decreasing bin packing algorithm to choose an appropriate parcel for the items in a cart. Follow this guide to get setup and then optimize.

### Setup Shipping Options in Shippo App

Lets assume shipping from Canada to customers in Canada and USA via “Standard” and “Express” options

This would require setting up 4 shipping options in Shippo (\<https://apps.goshippo.com/settings/rates-at-checkout>)

1.  Standard Shipping Canada
2.  Express Shipping Canada
3.  Standard Shipping USA
4.  Express Shiping USA

Set each shipping option to “Live rate” and assign *service(s)* to them

For example:

*   Express Shipping Canada: *Canada Post XpressPost*
*   Express Shipping USA: *Canada Post XpressPost USA*
*   *…*

For more in-depth details see https://support.goshippo.com/hc/en-us/articles/4403207559963

### Assign Shipping Options to Regions in Medusa

Create shipping options for regions as usual

[See here for common issue](#help-adding-a-shipping-method-to-cart-throws-an-error)


## Using Rates at Checkout

As of v0.12.0, the CustomShippingOptionService is no longer used, in favour of decorators. This introduced some significant improvements along with breaking changes. This was likely the final breaking change to this feature.

### Retrieving Shipping Options with Rates

[Retrieve shipping options for cart](https://docs.medusajs.com/api/store/shipping-option/retrieve-shipping-options-for-cart) as usual and if any are setup for live-rates they will have a rate.

Implementations need to consider rates can only calculate if the cart has items and a complete shipping address.

**HTTP:**

```plaintext
GET /shipping-options/:cart_id
```

**Service:**

```javascript
await shippoRatesService.retrieveShippingOptions(cart_id)
```

Retrieving only decorates the shipping options with rates for display purposes. Each retrieval will fetch rates from shippo's api and re-decorate the options. They have no relation to the rate and are stateless templates for creating shipping methods.

The rate is applied to the shipping method.

[Add a shipping method to the Cart.
](https://docs.medusajs.com/api/store/cart/add-a-shipping-method)

**HTTP:**

```plaintext
POST /carts/:id/shipping-methods
```

### Help, adding a shipping method to cart throws an error

Shipping option's have a `price_type` that is either `flat_rate` or `calculated`. If the shipping option was created with [Medusa Admin](https://github.com/medusajs/admin) then it was set as`flat_rate`.

[But why?](https://github.com/medusajs/admin/blob/de512d2b58e51c61e9d88ca5327c93138245ba41/src/domain/settings/regions/new-shipping.tsx#L79-L90) 

Did you notice [line 85](https://github.com/medusajs/admin/blob/de512d2b58e51c61e9d88ca5327c93138245ba41/src/domain/settings/regions/new-shipping.tsx#L85)

Medusa Admin has not yet matured, so this is an implementation detail that will eventually get fixed

For now, either add calculated shipping options via api, or you can edit the culprit line to:

```javascript=
price_type: (options[optionIndex].type === "LIVE_RATE") 
    ? "calculated" 
    : "flat_rate",
```

Or whatever works for you...

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
    *   If all items cannot fit into single parcel, use the default template (*future implementation planned - this is because not all carriers in shippo support single orders with multi parcels*)

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

View the orders at \<https://apps.goshippo.com/orders>

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

## **Packing Slips**

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

## Webhooks

> Note: This section is WIP

### Disclaimer

Incoming HTTP requests from Shippo to webhook endpoints lack authentication. No secret token, no signature in the request header, no bearer, nothing.

Before enabling webhooks, understand the risks of an open and insecure HTTP endpoint that consumes data, and how to mitigate this. Please DO NOT use this without SSL/TLS. [Whitelisting shippo IP's](https://groups.google.com/g/shippo-api-announce/c/1A6m6Snvypk) for webhook routes is highly encouraged and recommended. There are also intermediary third party services such as pipedream and hookdeck that can be used to relay requests.

You will also need to self generate a token and add it as a url query param. Ya I know… but it's better than nothing and it is encrypted over HTTPS

The flow at the code level is:

1.  Webhook receives POST data
2.  URL query token is verified
3.  The request json gets verified by fetching the same object directly from shippo API, following these steps:
    1.  Request body contains json claiming to be a shippo object. 
    2.  Ok, but lets fetch this object directly from Shippo's API
    3.  If the fetch resolves to the object requested, then use that data instead of the untrusted input 
    4.  Otherwise throw a HTTP 500 and do nothing

The code is doing its part, follow it and see [`src/api/routes/hooks`](https://github.com/macder/medusa-fulfillment-shippo/tree/main/src/api/routes/hooks) Make sure you do your part, or leave this feature disabled.

Send an email to <support@goshippo.com> requesting they add auth to their webhooks. They do require authentication to use their endpoints…

### Setup

In `.env` add `SHIPPO_WEBHOOK_SECRET=some_secret_string` 

Add to `medusa-config.js`

```plaintext
const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY
const SHIPPO_WEBHOOK_SECRET = process.env.SHIPPO_WEBHOOK_SECRET

{
  resolve: `medusa-fulfillment-shippo`,
  options: {
    api_key: SHIPPO_API_KEY,
    webhook_secret: SHIPPO_WEBHOOK_SECRET,
    weight_unit_type: 'g',
    dimension_unit_type: 'cm'
  },
},
```

### Hooks

Hooks need to be added in [Shippo app settings](https://apps.goshippo.com/settings/api)

Then send a sample. If everything is good you will see this in console:

```plaintext
Processing shippo.received.transaction_created which has 0 subscribers
 [Error: Item not found] {
   type: 'ShippoNotFoundError',
   code: undefined,
   detail: '{"detail": "Not found"}',
   path: '/transactions/[some_random_id]',
   statusCode: 404
 }
Processing shippo.rejected.transaction_created which has 0 subscribers
```

This is the expected behaviour because the data could not be verified. Since it is a sample, when the plugin tried to verify the transaction by requesting the same object directly from shippo api, it did not exist. It will NOT use input data beyond making the verification, so it gets rejected.

### How to test

Documentation WIP...

### transaction\_created

`https://server:port/hooks/shippo/transaction?token=SHIPPO_WEBHOOK_SECRET`

Receives a Shippo transaction object when a label is purchased

*   Updates fulfillment to “shipped”
*   Adds tracking number and link to fulfillment

*For orders created with v0.11.0 up:*

*   Adds label url, settled rate, estimated rate (if shipping method was calculated at checkout), and transaction ID to the fulfillments metadata

Events

Received POST

`shippo.received.transaction_created`

Accepted POST as valid

`shippo.accepted.transaction_created`

Rejected POST request

`shippo.rejected.transaction_created`

### transaction\_updated

*under development*

### track\_updated

*under development*

### batch\_purchased

*under development*

### batch\_created

*under development*

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

Currently, this plugin does not support returns/exchanges and customs declarations,

These are currently under development for future releases.

## Resources

Medusa Docs\
https://docs.medusajs.com/

Medusa Shipping Architecture:\
https://docs.medusajs.com/advanced/backend/shipping/overview

Shippo API\
https://goshippo.com/docs/intro\
https://goshippo.com/docs/reference
