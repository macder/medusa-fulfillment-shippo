# medusa-fulfillment-shippo

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/macder/medusa-fulfillment-shippo/tree/main.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/macder/medusa-fulfillment-shippo/tree/main)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/5ca5e600f1574354a8056441f589ca80)](https://www.codacy.com/gh/macder/medusa-fulfillment-shippo/dashboard?utm_source=github.com\&utm_medium=referral\&utm_content=macder/medusa-fulfillment-shippo\&utm_campaign=Badge_Grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/5ca5e600f1574354a8056441f589ca80)](https://www.codacy.com/gh/macder/medusa-fulfillment-shippo/dashboard?utm_source=github.com\&utm_medium=referral\&utm_content=macder/medusa-fulfillment-shippo\&utm_campaign=Badge_Coverage)

> :information\_source: Requires Medusa 1.3.3^

Shippo fulfillment provider for Medusa Commerce.

Provides fulfillment options using carrier service levels and user created service groups that can be used to create shipping options for profiles and regions.

Rates at checkout optimized with a [first-fit-decreasing (FFD)](https://en.wikipedia.org/wiki/First-fit-decreasing_bin_packing) bin packing algorithm.

Fulfillments create orders in shippo.

Supports returns, exchanges, and claims.

**Implement the details your own way**

[Methods and wrappers](#api-reference) that simplify interfacing, consuming, and integrating shippo's api with medusa.

Actions that produce data emit [events](#events). The plugin does not make assumptions or save data arbitrarily, it passes it through the eventbus instead. Access payloads to perform additional operations by [subscribing to events](https://docs.medusajs.com/advanced/backend/subscribers/create-subscriber).


## Table of Contents

*   [Getting Started](#getting-started)
*   [Orders](#orders)
*   [Packing Slips](#packing-slips)
*   [Returns](#returns)
    *   [Request](#request)
*   [Swaps](#swaps)
    *   [Create](#create)
    *   [Fulfillment](#fulfillment)
*   [Claims](#claims)
    *   [Refund](#refund)
    *   [Replace](#replace)
    *   [Fulfillment](#fulfillment-1)
*   [Rates at Checkout](#rates-at-checkout)
    *   Setup
        *   [Shipping Options in Shippo App](#setup-shipping-options-in-shippo-app)
        *   [Assign Shipping Options to Regions in Medusa](#assign-shipping-options-to-regions-in-medusa)
    *   [During Checkout](#during-checkout)
        *   [Set rates for cart](#set-rates-for-cart)
        *   [Add to Cart](#add-to-carlst)
        *   [Help, adding a shipping method to cart throws an error](#help-adding-a-shipping-method-to-cart-throws-an-error)
*   [Webhooks](#webhooks)
*   [API Reference](#api-reference)
    *   [ShippoClientService](#shippoclientservice)
    *   [ShippoPackerService](#shippopackerservice)
    *   [ShippoRatesService](#shipporatesservice)
    *   [ShippoTransactionService](#shippotransactionservice)
*   [Events](#events)
*   [Shippo Node Client](#shippo-node-client)
*   [Optimizing Rates at Checkout](#optimizing-rates-at-checkout)
    *   [Setup parcel templates](#setup-parcel-templates)
    *   [Verify product dimensions and weight](#verify-product-dimensions-and-weight)
    *   [Accuracy of Rates](#accuracy-of-rates)
*   [Limitations](#limitations)
*   [Resources](#resources)

## Getting started

Install:

`> npm i medusa-fulfillment-shippo`

Add to medusa-config.js

```javascript
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

## Orders

Creating an order fulfillment makes a new order in shippo. An event is emitted with the response data and related internal ids.

[Create a Subscriber](https://docs.medusajs.com/advanced/backend/subscribers/create-subscriber) to access the data.

**Event:**
`shippo.order_created`

```javascript
{
  order_id: "",
  fulfillment_id: "",
  customer_id: "",
  shippo_order: {...}
}
```

### Retrieve

**Service:**

```javascript
await shippoClientService.fetchOrder(fulfillmentId)
```

~~**HTTP:**~~

*Deprecated*

```plaintext
GET /admin/fulfillments/:id/shippo/order
```

Returns `shippo_order` object

## **Packing Slips**

Retrieve Shippo packing slip for a fulfillment

**Service:**

```javascript
await shippoClientService.fetchPackingSlip(fulfillmentId)
```

~~**HTTP:**~~

*Deprecated*

```plaintext
GET /admin/fulfillments/:id/shippo/packingslip
```

## Returns

### Request

Invoked when [Request a Return](https://docs.medusajs.com/api/admin/order/request-a-return) `return_shipping` has `provider: shippo`

Attempts fetching an existing return label from shippo.

**Event:**
`shippo.return_requested`

```javascript
{
  order: {...}, // return order
  transaction: {...} // shippo transaction for return label OR null
}
```

## Swaps

### Create

Invoked when [Create a Swap](https://docs.medusajs.com/api/admin/order/create-a-swap) `return_shipping` has `provider: shippo`

Attempts fetching an existing return label from shippo.

**Event:**
`shippo.swap_created`

```javascript
{
  order: {...}, // return order
  transaction: {...} // shippo transaction for return label OR null
}
```

### Fulfillment

Invoked when [Create a Swap Fulfillment](https://docs.medusajs.com/api/admin/order/create-a-swap-fulfillment) `shipping_option` has `provider: shippo`

Creates an order in shippo.

**Event:**
`shippo.replace_order_created`

```javascript
{
  order_id: "",
  fulfillment_id: "",
  customer_id: "",
  shippo_order: {...}
}
```

## Claims

### Refund

Invoked when [Create a Claim](https://docs.medusajs.com/api/admin/order/create-a-claim) has `type: refund` and `return_shipping` has `provider: shippo`

Attempts fetching an existing return label from shippo.

**Event:**
`shippo.claim_refund_created`

```javascript
{
  order: {...}, // return order
  transaction: {...} // shippo transaction for return label OR null
}
```

### Replace

Invoked when [Create a Claim](https://docs.medusajs.com/api/admin/order/create-a-claim) has `type: replace` and `return_shipping` has `provider: shippo`

Attempts fetching an existing return label from shippo.

**Event:**
`shippo.claim_replace_created`

```javascript
{
  order: {...}, // return order
  transaction: {...} // shippo transaction for return label OR null
}
```

### Fulfillment

Invoked when [Create a Claim Fulfillment](https://docs.medusajs.com/api/admin/order/create-a-claim-fulfillment) `shipping_option` has `provider: shippo`

Creates an order in shippo.

**Event:**
`shippo.replace_order_created`

```javascript
{
  order_id: "",
  fulfillment_id: "",
  customer_id: "",
  shippo_order: {...}
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

### During Checkout

[Retrieve shipping options for cart](https://docs.medusajs.com/api/store/shipping-option/retrieve-shipping-options-for-cart) as usual and any `price_type: calculated` options belonging to `provider: shippo` will have `amount: Number`.

**HTTP:**

```plaintext
GET /store/shipping-options/:cart_id
```

**Service:**

```javascript
const shippingOptions = await shippingProfileService.fetchCartOptions(cart)
```

Implementation needs to consider rates only calculate if cart has items and complete shipping address. Otherwise `price_type: calculated` will have `amount: null`

Retrieving only decorates the shipping options with rates for display purposes. They are stateless objects. Each retrieval will re-fetch rates from shippo's api and re-decorate the options.

### Add to Cart

[Add a Shipping Method](https://docs.medusajs.com/api/store/cart/add-a-shipping-method) and if  `shipping_option` has `price_type: calculated` the rate will be saved to the `shipping_method`

**HTTP:**

```plaintext
POST /store/carts/:id/shipping-methods
 --data '{"option_id":"example_cart_option_id"}'
```

### Help, adding a shipping method to cart throws an error

This is an issue with medusa-admin. Examine line 85 [`admin/src/domain/settings/regions/new-shipping.tsx`](https://github.com/medusajs/admin/blob/a33ed20214297ffdbd2383f809dddd4870f5dad9/src/domain/settings/regions/new-shipping.tsx#L85)

Options with `price_type: flat_rate` will not pass through [`fulFillmentProviderService.calculatePrice()`](https://docs.medusajs.com/references/services/classes/FulfillmentProviderService#calculateprice)

medusa-admin is still early phase software.

Workaround it, use the REST api directly, or patch the issue for now

Possible interim solution:

```javascript
price_type: (options[optionIndex].type === "LIVE_RATE") 
    ? "calculated" 
    : "flat_rate",
```

## Webhooks

> Note: This section is WIP

### Disclaimer

Incoming HTTP requests from Shippo to webhook endpoints lack authentication. No secret token, no signature in the request header, no bearer, nothing.

Before enabling webhooks, understand the risks of an open and insecure HTTP endpoint that consumes data, and how to mitigate this. Please DO NOT use this without SSL/TLS. [Whitelisting shippo IP's](https://groups.google.com/g/shippo-api-announce/c/1A6m6Snvypk) is a good idea. There are also intermediary third party services such as pipedream and hookdeck that can be used to relay requests.

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

### Setup

In `.env` add `SHIPPO_WEBHOOK_SECRET=some_secret_string` 

Add to `medusa-config.js`

```javascript
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

```shell
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

This is the expected behaviour because the data could not be verified. Since it is a sample, when the plugin tried to verify the transaction by requesting the same object back directly from shippo api, it did not exist. It will NOT use input data beyond making the verification, so it gets rejected.

### How to test

Documentation WIP...

### transaction\_created

**Endpoint:**

`/hooks/shippo/transaction?token=SHIPPO_WEBHOOK_SECRET`

Receives shippo transaction object when label purchased

*   Updates fulfillment to “shipped”
*   Adds tracking number and link to fulfillment

**Events:**

`shippo.transaction_created.shipment`

```javascript
{
  order_id: "",
  fulfillment_id: "",
  transaction: {...}
}
```

`shippo.transaction_created.return_label`

```javascript
{
  order_id: "",
  transaction: {...}
}
```

### transaction\_updated

**Endpoint:**

`/hooks/shippo/transaction?token=SHIPPO_WEBHOOK_SECRET`

Receives shippo transaction object when transaction updated

**Event:**

`shippo.transaction_updated.payload`

```javascript
{
  order_id: "",
  fulfillment_id: "",
  transaction: {...}
}
```

# API Reference

Documented Public API is considered stable release candidate for 1.0

Any public method not documented here may change prior to a 1.0 release

For guide, see [Using Custom Service](https://docs.medusajs.com/advanced/backend/services/create-service#using-your-custom-service)

## `ShippoClientService`

*Stable v0.16.0+*

Defined in: [`src/services/shippo-client.js`](https://github.com/macder/medusa-fulfillment-shippo/blob/main/src/services/shippo-client.js)

### `useClient`

`@property`

An instance of `shippo-node-client` ([forked](#shippo-node-client))

```javascript
const client = shippoClientService.useClient

//eg.
const order = client.order.retrieve(id)
...
// see shippo-node-client docs for methods
```

### `fetchExpandedTransactions()`

`@param {Order} order`

`@return {array.<object>}`

Fetches the `Order` transactions from shippo

More useful data than [`api.goshippo.com/transactions`](https://goshippo.com/docs/reference#transactions)

`rate`, `parcel`, `address_to`, `order` + other fields are expanded, AND includes `is_return`

```javascript
await shippoClientService.fetchExpandedTransactions(order)
```

### `fetchOrder()`

`@param {string} fulfillmentId`

`@return {Object}`

Fetches order from shippo for the `Fulfillment`

```javascript
await shippoClientService.fetchOrder(fulfillmentId)
```

### `fetchPackingSlip()`

`@param {string} fulfillmentId`

`@return {Object}`

Fetches packing slip from shippo for the `Fulfillment`

```javascript
await shippoClientService.fetchPackingSlip(fulfillmentId)
```

### `fetchSenderAddress()`

`@return {Object}`

Fetches the shippo account's default sender address

```javascript
await shippoClientService.fetchSenderAddress()
```

### `fetchUserParcelTemplates()`

`@return {array.<object>}`

Fetches all custom parcel templates from shippo account

```javascript
await shippoClientService.fetchUserParcelTemplates()
```

### `poll()`

`@param {object} obj`

`@param {obj.function} fn`

`@param {obj.function} validate`

`@param {obj.number} interval`

`@param {obj.number} maxAttempts`

`@return {Promise}`

Generic polling method. Useful for [Asynchronous API Response Handling](https://goshippo.com/docs/async/)

`fn` must be callable that returns some result

`validate` must be a callable that returns a bool from testing result data. i.e. method that validates whether desired result achieved, or keep polling

`interval` milliseconds between executions

`maxAttempts` ...

```javascript
await shippoClientService.poll({
  fn: async () => await fetchAsyncEndpoint(params),
  validate: (result) => result === "foo bar",
  interval: 2500,
  maxAttempts: 3,
})
```

## `ShippoPackerService`

*Stable v0.16.0+*

Defined in: [`src/services/shippo-packer.js`](https://github.com/macder/medusa-fulfillment-shippo/blob/main/src/services/shippo-packer.js)

### `packBins()`

Packs line items into parcel templates defined in shippo account using a [FFD algorithm](https://en.wikipedia.org/wiki/First-fit-decreasing_bin_packing)

First array member is best fit, i.e. has lowest vacant volume

`@param {array.<LineItem>} lineItems`

`@return {array.<object>} `

```javascript
const packed = await shippoPackerService.packBins(lineItems)
```

## `ShippoRatesService`

*Stable v0.15.0+*

Defined in: [`src/services/shippo-rates.js`](https://github.com/macder/medusa-fulfillment-shippo/blob/main/src/services/shippo-rates.js)

### `fetchCartRates()`

Fetches an array of [shippo live-rate objects](https://goshippo.com/docs/reference#rates-at-checkout) filtered against the carts `ShippingOptions` that are `price_type: calculated`

Cart must have items and complete shipping address

`@param {string} cartId`

`@return {array.<object>}`

```javascript
const rates = await shippoRatesService.fetchCartRates(cartId)
```

### `fetchOptionRate()`

Fetches a [shippo live-rate object](https://goshippo.com/docs/reference#rates-at-checkout) for a specific shipping option available to a cart

Cart must have items and complete shipping address

`@param {string} cartId`

`@param {string|FulfillmentOption} // so_id or FulfillmentOption`

```javascript
const rate = await shippoRatesService.fetchOptionRate(cartId, shippingOption.id)
// OR
const rate = await shippoRatesService.fetchOptionRate(cartId, shippingOption.data)
```

### ~~`fetchCartOptions()`~~

*Deprecated* - see [#179](https://github.com/macder/medusa-fulfillment-shippo/issues/179)

Use `ShippingProfileService` [fetchCartOptions()](https://docs.medusajs.com/references/services/classes/ShippingProfileService#fetchcartoptions) instead

~~Same as [`ShippingProfileService.fetchCartOptions`](https://docs.medusajs.com/references/services/classes/ShippingProfileService#fetchcartoptions) except if the cart has shipping address and items, any `ShippingOption` with `price_type: calculated` and `provider: shippo` is contextually priced.~~

`@param {string} cartId`

`@return {array.<ShippingOption>}`

```javascript
const shippingOptions = await shippoRatesService.fetchCartOptions(cartId)
```

## `ShippoTransactionService`

Provides a layer to simpify relating `Order` and `Fulfillment` with shippo transactions.

[Transactions](https://goshippo.com/docs/reference#transactions) are shippo objects created when a label is purchased

*Stable v0.18.0+*

Defined in: [`src/services/shippo-transaction.js`](https://github.com/macder/medusa-fulfillment-shippo/blob/main/src/services/shippo-transaction.js)

### `fetch()`

Shorthand for `shippoClientService.useClient.transaction.retrieve(id)`

`@param {string} id`

```javascript
await shippoTransactionService.fetch(transactionId)
```

### `fetchExtended()`

Fetches transaction object with additional and expanded fields

`@param {string|object} transaction id or object`

`@return {object}`

```javascript
await shippoTransactionService.fetchExtended(transaction)
```

### `findFulfillment()`

Finds the `Fulfillment` for the transaction

`@param {string|object} transaction id or object`

`@return {Fulfillment}`

```javascript
await shippoTransactionService.findFulfillment(transaction)
```

### `findOrder()`

Finds the `Order` that has a `Fulfillment` with this transaction

`@param {string|object} transaction id or object`

`@return {Order}`

```javascript
await shippoTransactionService.findOrder(transaction)
```

## Events

List of all events, their triggers, and expected payload for handlers

[Subscribe to events](https://docs.medusajs.com/advanced/backend/subscribers/create-subscriber) to perform additional operations

These events only emit if the action pertains to `provider: shippo`

### `shippo.order_created`

Triggered when a new [fulfillment](https://docs.medusajs.com/api/admin/order/create-a-fulfillment) creates a shippo order.

#### Payload
```javascript
{
  order_id: "",
  fulfillment_id: "",
  customer_id: "",
  shippo_order: {...}
}
```

### `shippo.return_requested` 

Triggered when a [return is requested](https://docs.medusajs.com/api/admin/order/request-a-return)

If the return `ShippingMethod` has `provider: shippo` it attempts to find an existing return label in shippo.

#### Payload
```javascript
{
  order: {...}, // return order
  transaction: {...} // shippo transaction for return label OR null
}
```

### `shippo.swap_created`

Triggered when a [swap is created](https://docs.medusajs.com/api/admin/order/create-a-swap) 

If return `ShippingMethod` has `provider: shippo` it attempts to find an existing return label in shippo.

#### Payload
```javascript
{
  order: {...}, // return order
  transaction: {...} // shippo transaction for return label OR null
}
```

### `shippo.replace_order_created`

Triggered when a [Swap Fulfillment](https://docs.medusajs.com/api/admin/order/create-a-swap-fulfillment) or [Claim Fulfillment](https://docs.medusajs.com/api/admin/order/create-a-claim-fulfillment) is created.

If the `ShippingMethod` has `provider: shippo` a shippo is created

#### Payload
```javascript
{
  order_id: "",
  fulfillment_id: "",
  customer_id: "",
  shippo_order: {...}
}
```

`shippo.claim_refund_created`
`shippo.order_created`


## Shippo Node Client

This plugin is using a forked version of the official shippo-node-client. 

The fork adds support for the following endpoints:

*   live-rates
*   service-groups
*   user-parcel-templates
*   orders/:id/packingslip
*   ...
*   Doc is WIP

The client is exposed on the `useClient` property of `shippoClientService`

```javascript
const client = shippoClientService.useClient

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

## Optimizing Rates at Checkout

Dimensional weight is a major factor in determining costs. Estimates are frivolous when based on inaccurate parcel volume and weight. This raises a challenging problem in computing which parcel box to use. While this is simple for single items, it becomes increasingly difficult when packing multiple items of various dimensions. It is a classic [bin packing problem](https://en.wikipedia.org/wiki/Bin_packing_problem), [NP-Hard](https://en.wikipedia.org/wiki/NP-hardness) stuff.

This plugin uses [binpackingjs](https://github.com/olragon/binpackingjs) which provides a [first-fit](https://en.wikipedia.org/wiki/First-fit_bin_packing) algorithm. Additional logic is wrapped around it to get a more optimized [first-fit-decreasing](https://en.wikipedia.org/wiki/First-fit-decreasing_bin_packing) algorithm. In order for this to be effective, parcel templates need to be setup in the Shippo account, and all products in medusa must have values for length, width, height, and weight.

### Setup parcel templates

Create package templates in the [Shippo app settings](https://apps.goshippo.com/settings/packages)

To get most optimal results, it is recommended to create package templates for all your shipping boxes.

### Verify product dimensions and weight

In your medusa store, make sure products have correct values for length, width, height, weight

### Accuracy of Rates

Shipping rate estimates are calculated by third parties using data you supply. The onus is on the store admin to supply accurate data values about their products and packaging. This plugin does its best to use this data to create optimized requests, within reason and scope, to retrieve rates from Shippo. The intent is to provide a cost-cutting solution, but there is no one-size-fits all.

Assuming accurate data for product dimensions, weight, and package templates in shippo reflect a carefully planned boxing strategy, expect reasonably accurate rates for single item and multi-item fulfillment's that fit in a single parcel. Multi parcel for rates at checkout is currently not supported (future consideration). If items cannot fit into a single box, the default package template set in [Shippo app settings](https://apps.goshippo.com/settings/rates-at-checkout) is used.

## Limitations

No support for customs declarations. Planned for future release.

## Resources

Medusa Docs\
https://docs.medusajs.com/

Medusa Shipping Architecture:\
https://docs.medusajs.com/advanced/backend/shipping/overview

Shippo API\
https://goshippo.com/docs/intro\
https://goshippo.com/docs/reference
