# medusa-fulfillment-shippo

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/macder/medusa-fulfillment-shippo/tree/main.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/macder/medusa-fulfillment-shippo/tree/main)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/5ca5e600f1574354a8056441f589ca80)](https://www.codacy.com/gh/macder/medusa-fulfillment-shippo/dashboard?utm_source=github.com\&utm_medium=referral\&utm_content=macder/medusa-fulfillment-shippo\&utm_campaign=Badge_Grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/5ca5e600f1574354a8056441f589ca80)](https://www.codacy.com/gh/macder/medusa-fulfillment-shippo/dashboard?utm_source=github.com\&utm_medium=referral\&utm_content=macder/medusa-fulfillment-shippo\&utm_campaign=Badge_Coverage)

> :information\_source: Requires Medusa ^1.3.5

Shippo fulfillment provider for Medusa Commerce.

Provides fulfillment options using carrier service levels and user created service groups that can be used to create shipping options for profiles and regions.

Rates at checkout optimized with a [first-fit-decreasing (FFD)](https://en.wikipedia.org/wiki/First-fit-decreasing_bin_packing) bin packing algorithm.

Fulfillments create orders in shippo.

Supports returns, exchanges, and claims.

[Public interface](#public-interface) for rapid custom integration.

[Eventbus payloading](#events) instead of arbitrary data assumption and storage.

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
    *   [Shipping Options in Shippo App](#setup-shipping-options-in-shippo-app)
    *   [Assign Shipping Options to Regions in Medusa](#assign-shipping-options-to-regions-in-medusa)
    *   [During Checkout](#during-checkout)
    *   [Set rates for cart](#set-rates-for-cart)
    *   [Add to Cart](#add-to-carlst)
    *   [Help, adding a shipping method to cart throws an error](#help-adding-a-shipping-method-to-cart-throws-an-error)
*   [Webhooks](#webhooks)
*   [Public Interface](#public-interface)
    *   [Detailed Reference](#public-interface)
    *   [Quick Reference](#quick-reference)
*   [Events](#events)
*   [Shippo Node Client](#shippo-node-client)
*   [Shipping Rates](#shipping-rates)
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
      webhook_secret: '', // README section on webhooks before using!
      webhook_test_mode: false
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

```javascript
await shippoService.order.fetch(object_id)

await shippoService.order.fetchBy(["fulfillment", ful_id]

await shippoService.order.with(["fulfillment"]).fetch(object_id)
```

[See references](#order) for all methods

## Packing Slips

### Retrieve

```javascript
const { object_id } = order

await shippoService.packingslip.fetch(object_id)

await shippoService.packingslip.fetchBy(["fulfillment"], ful_id)

await shippoService.packingslip.with(["fulfillment"]).fetch(object_id)
```

[See references](#packingslip) for all methods

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

### Setup parcel templates

Create package templates in the [Shippo app settings](https://apps.goshippo.com/settings/packages)

To get most optimal results, it is recommended to create package templates for all your shipping boxes.

### Verify product dimensions and weight

In your medusa store, make sure products have correct values for length, width, height, weight

### During Checkout

[Retrieve shipping options for cart](https://docs.medusajs.com/api/store/shipping-option/retrieve-shipping-options-for-cart) as usual and any `price_type: calculated` options belonging to `provider: shippo` will have `amount: Number`.

Rates calculate only if cart has shipping address and items

**HTTP:**

```plaintext
GET /store/shipping-options/:cart_id
```

**Service:**

```javascript
const shippingOptions = await shippingProfileService.fetchCartOptions(cart)
```

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

### Caution

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
    weight_unit_type: 'g',
    dimension_unit_type: 'cm',
    webhook_secret: SHIPPO_WEBHOOK_SECRET,
    webhook_test_mode: false    
  },
},
```

### Endpoints

Hooks need to be setup in [Shippo app settings](https://apps.goshippo.com/settings/api)

**transaction\_created**: `/hooks/shippo/transaction?token=SHIPPO_WEBHOOK_SECRET`

**transaction\_updated**: `/hooks/shippo/transaction?token=SHIPPO_WEBHOOK_SECRET`

**track\_updated**: `/hooks/shippo/track?token=SHIPPO_WEBHOOK_SECRET`

Then send a sample. If everything is good you will see this in console:

```shell
Processing shippo.received.transaction_created which has 0 subscribers
Processing shippo.rejected.transaction_created which has 0 subscribers
```

This is the expected behaviour because the data could not be verified. Since it is a sample, when the plugin tried to verify the transaction by requesting the same object back directly from shippo api, it did not exist. It will NOT use input data beyond making the verification, so it gets rejected.

### Test Mode

Test mode bypasses input authenticity verification, i.e. it will use the untrusted input data instead of requesting the same data back from shippo.

This allows testing using data that does not exist in shippo.

To enable, set `webhook_test_mode: true` in `medusa-config.js` plugin options.

Running in test mode is a security risk, enable only for testing purposes.

### transaction\_created

`/hooks/shippo/transaction?token=SHIPPO_WEBHOOK_SECRET`

Receives shippo transaction object when label purchased

*   Updates fulfillment to “shipped”
*   Adds tracking number and link to fulfillment

#### Events

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

`/hooks/shippo/transaction?token=SHIPPO_WEBHOOK_SECRET`

Receives shippo transaction object when transaction updated

#### Events

`shippo.transaction_updated.payload`

```javascript
{
  order_id: "",
  fulfillment_id: "",
  transaction: {...}
}
```

### track\_updated

`/hooks/shippo/track?token=SHIPPO_WEBHOOK_SECRET`

#### Events

`shippo.track_updated.payload`

```javascript
{
  ...track
}
```

## Public Interface

References the declared public interface for client consumption, the [semver](https://semver.org/) "Declared Public API"

Although there is nothing stopping you from accessing and using public methods behind the interface, be aware that those implementation details can and will change. The purpose of the interface is semver compliant stability.

> Notice: (semver 0.x.x) - methods labeled `@experimental` have high probability of breaking changes

### Getting Started

Dependency inject `shippoService` as you would with any other service

For guide, see [Using Custom Service](https://docs.medusajs.com/advanced/backend/services/create-service#using-your-custom-service)

---

### address.fetch()
`@return Promise.<object>`

Fetch default sender address

```javascript
shippoService.account.address()
```

---

### order.fetch(id)

Fetch an order from shippo

#### Parameters

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `String` | The object_id for an order |

#### Return

`Promise.<object>`

#### Example
```javascript
await shippoService.order.fetch(object_id)
```

---

### order.with([entity]).fetch(id)

Fetch a shippo order with a related entity.

#### Parameters

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `String` | The object_id for an order |
| entity | `Array.<string>` | The entity to attach  |

#### Supported Entities 

`fulfillment`

#### Return
`Promise.<object>`


#### Example

```javascript
await shippoService.order.with(["fulfillment"]).fetch(object_id)

/* @return */
{
  ...order,
  fulfillment: {
    ...fulfillment
  }
}
```

---

### order.fetchBy([entity, id])

Fetch a shippo order using the id of a related entity

#### Parameters

`@param {[entity: string, id: string>]}`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| entity | `string` | The entity type to fetch order by |
| id | `string` | Id of the entity | 

#### Supported Entities 

`fulfillment` `local_order` `claim` `swap`

#### Return

`Promise.<object|object[]>`

#### Example
```javascript
/* @return {Promise.<object>} */

await shippoService.order.fetchBy(["fulfillment", id])
```

```javascript
/* @return {Promise.<object[]>} */

await shippoService.order.fetchBy(["local_order", id])

await shippoService.order.fetchBy(["claim", id])

await shippoService.order.fetchBy(["swap", id])
```

---

### package.for([entity, id]).fetch()

Bin pack items to determine best fit parcel using package templates from [shippo account](https://apps.goshippo.com/settings/packages)

Will return full output from binpacker, including locus. The first array member is best fit

See also: [override package templates](#override-parcel-templates)

#### Parameters

`@param {[entity: string, id: string>]}`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| entity | `string` | Entity type  |
| id \| items | `string\|array` | The id of {[entity]} or array of items |

#### Supported Entities 

`cart` `local_order` `fulfillment` `line_items`

#### Return

`Promise.<object[]>`

#### Example
```javascript
// use parcel templates defined in shippo account

await shippoService.package.for(["cart", id]).fetch()

await shippoService.package.for(["local_order", id]).fetch()

await shippoService.package.for(["fulfillment", id]).fetch()

await shippoService.package.for(["line_items", [...lineItems]]).fetch()
```

#### Override Parcel Templates

`package.set("boxes", [...packages])`

```javascript
const packages = [
  {
    id: "id123",
    name: "My Package",
    length: "40",
    width: "30",
    height: "30",
    weight: "10000", // max-weight
  },
  {...}
]

shippoService.package.set("boxes", packages)

await shippoService.package.for(["cart", id]).get()
...
```

---

### packingslip.fetch(id)

Fetch the packingslip for shippo order

#### Parameters

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `String` | The object_id of the order to get packingslip for |

#### Return

`Promise.<object>`

#### Example
```javascript
const { object_id } = order

await shippoService.packingslip.fetch(object_id)
```

---

### packingslip.with([entity]).fetch(id)

Fetch the packingslip for shippo order with a related entity.

#### Parameters

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `String` | The object_id of the order to get packingslip for |
| entity | `Array.<string>` | The entity to attach  |

#### Supported Entities 

`fulfillment`

#### Return
`Promise.<object>`

#### Example

```javascript
await shippoService.packingslip.with(["fulfillment"]).fetch(object_id)

/* @return */
{
  ...packingslip,
  fulfillment: {
    ...fulfillment
  }
}
```

---

### packingslip.fetchBy([entity, id])

Fetch the packing slip for a shippo order, using the id of a related entity

#### Parameters

`@param {[entity: string, id: string>]}`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| entity | `string` | The entity type to fetch packingslip by |
| id | `string` | Id of the entity | 

#### Supported Entities 

`fulfillment` `local_order` `claim` `swap`

#### Return

`Promise.<object|object[]>`

#### Example
```javascript
/* @return {Promise.<object>} */

await shippoService.packingslip.fetchBy(["fulfillment", id])
```

```javascript
/* @return {Promise.<object[]>} */

await shippoService.packingslip.fetchBy(["local_order", id])

await shippoService.packingslip.fetchBy(["claim", id])

await shippoService.packingslip.fetchBy(["swap", id])
```

---

### track.fetch(carrier_enum, track_num)

Fetch a tracking status object

#### Parameters


| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| carrier_enum | `string` | The [carrier enum token](https://goshippo.com/docs/reference#carriers) |
| track_num | `string` | The tracking number | 

#### Return

`Promise.<object>`

#### Example

```javascript
await shippoService.track.fetch("usps", "trackingnumber")
```

---

### track.fetchBy([entity, id])

Fetch a tracking status object using id of related entity

`@param {[entity: string, id: string>]}`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| entity | `string` | The entity type to fetch tracking status by |
| id | `string` | Id of the entity | 


#### Supported Entities 

`fulfillment`

#### Return

`Promise.<object>`

#### Example

```javascript
await shippoService.track.fetchBy(["fulfillment", id])
```

---

### transaction.fetch(id)

Fetch a transaction object from shippo.

To fetch an extended version with additional fields, use `transaction.fetch(id, { type: extended})`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `String` | The object_id for transaction |

#### Return

`Promise.<object>`

#### Example

```javascript
await shippoService.transaction.fetch(object_id)

await shippoService.transaction.fetch(object_id, { type: "extended" })
```

### transaction.fetchBy([entity, id])

Fetch a transaction using the id of a related entity

#### Parameters

`@param {[entity: string, id: string>]}`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| entity | `string` | The entity type to fetch transaction by |
| id | `string` | Id of the entity | 

#### Supported Entities 

`fulfillment` `local_order`

#### Return

`Promise.<object|object[]>`

#### Example
```javascript
await shippoService.transaction.fetchBy(["local_order", id])

await shippoService.transaction.fetchBy(["local_order", id], { type: "extended" })

await shippoService.transaction.fetchBy(["fulfillment", id])

await shippoService.transaction.fetchBy(["fulfillment", id], { type: "extended" })
```

---


### Misc

#### is([entity, id], attr).fetch()

```javascript
await shippoService.is(["transaction", id], "return").fetch()

await shippoService.is(["order", id], "replace").fetch()
```

#### Client

`shippo-node-client` ([forked](#shippo-node-client))

```javascript
const client = shippoService.client 
```

#### find(entity).for([entity, id])

```javascript
/* @experimental */

await shippoService.find("fulfillment").for(["transaction", id])

await shippoService.find("order").for(["transaction", id])
```

---

### Quick Reference

```javascript
await shippoService.account.address()
```

```javascript
await shippoService.order.fetch(object_id)
```

```javascript
await shippoService.order.with(["fulfillment"]).fetch(object_id)
```

```javascript
await shippoService.order.fetchBy(["fulfillment", id])

await shippoService.order.fetchBy(["local_order", id])

await shippoService.order.fetchBy(["claim", id])

await shippoService.order.fetchBy(["swap", id])
```

```javascript
await shippoService.is(["order", id], "replace").fetch()
```

```javascript
await shippoService.package.for(["line_items", [...lineItems]]).fetch()

await shippoService.package.for(["cart", id]).fetch()

await shippoService.package.for(["local_order", id]).fetch()

await shippoService.package.for(["fulfillment", id]).fetch()
```

```javascript
// use any parcel templates 
const packages = [
  {
    id: "id123",
    name: "My Package",
    length: "40",
    width: "30",
    height: "30",
    weight: "10000", // max-weight
  },
  {...}
]

shippoService.package.set("boxes", packages)

await shippoService.package.for(["cart", id]).get()
```

```javascript
await shippoService.packingslip.fetch(object_id)
```

```javascript
await shippoService.packingslip.with(["fulfillment"]).fetch(object_id)
```

```javascript
await shippoService.packingslip.fetchBy(["fulfillment", id])

await shippoService.packingslip.fetchBy(["local_order", id]) 

await shippoService.packingslip.fetchBy(["claim", id]) 

await shippoService.packingslip.fetchBy(["swap", id]) 
```

```javascript
await shippoService.track.fetch("usps", "trackingnumber")
```

```javascript
await shippoService.track.fetchBy(["fulfillment", id])
```

```javascript
await shippoService.transaction.fetch(object_id)

await shippoService.transaction.fetch(object_id, { type: "extended" })
```

```javascript
await shippoService.transaction.fetchBy(["local_order", id])

await shippoService.transaction.fetchBy(["local_order", id], { type: "extended" })

await shippoService.transaction.fetchBy(["fulfillment", id])

await shippoService.transaction.fetchBy(["fulfillment", id], { type: "extended" })
```

```javascript
await shippoService.is(["transaction", id], "return").fetch()
```

```javascript
const client = shippoService.client 
```

```javascript
/* @experimental */

await shippoService.find("fulfillment").for(["transaction", id])

await shippoService.find("order").for(["transaction", id])
```

## Events

List of all events, their triggers, and expected payload for handlers

[Subscribe to events](https://docs.medusajs.com/advanced/backend/subscribers/create-subscriber) to perform additional operations

These events only emit if the action pertains to `provider: shippo`

### shippo.order_created

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

---

### shippo.return_requested

Triggered when a [return is requested](https://docs.medusajs.com/api/admin/order/request-a-return)

If the return `ShippingMethod` has `provider: shippo` it attempts to find an existing return label in shippo.

#### Payload

```javascript
{
  order: {...}, // return order
  transaction: {...} // shippo transaction for return label OR null
}
```

---

### shippo.swap_created

Triggered when a [swap is created](https://docs.medusajs.com/api/admin/order/create-a-swap)

If return `ShippingMethod` has `provider: shippo` it attempts to find an existing return label in shippo.

#### Payload

```javascript
{
  order: {...}, // return order
  transaction: {...} // shippo transaction for return label OR null
}
```

---

### shippo.replace_order_created

Triggered when a [swap](https://docs.medusajs.com/api/admin/order/create-a-swap-fulfillment) or [claim](https://docs.medusajs.com/api/admin/order/create-a-claim-fulfillment) fulfillment is created.

If the `ShippingMethod` has `provider: shippo` a shippo order is created

#### Payload

```javascript
{
  order_id: "",
  fulfillment_id: "",
  customer_id: "",
  shippo_order: {...}
}
```

---

### shippo.claim_refund_created

Triggered when a `type: refund` [claim is created](https://docs.medusajs.com/api/admin/order/create-a-claim)

If return `ShippingMethod` has `provider: shippo`, it attempts to find an existing return label in shippo

#### Payload

```javascript
{
  order: {...}, // return order
  transaction: {...} // shippo transaction for return label OR null
}
```

---

### shippo.claim_replace_created

Triggered when a `type: replace` [claim is created](https://docs.medusajs.com/api/admin/order/create-a-claim)

If return `ShippingMethod` has `provider: shippo`, it attempts to find an existing return label in shippo

#### Payload

```javascript
{
  order: {...}, // return order
  transaction: {...} // shippo transaction for return label OR null
}
```

---

### shippo.transaction_created.shipment

Triggered when the `transaction_created` webhook updates a `Fulfillment` status to `shipped`

#### Payload

```javascript
{
  order_id: "",
  fulfillment_id: "",
  transaction: {...}
}
```

---

### shippo.transaction_created.return_label

Triggered when the `transaction_created` webhook receives a return label transaction

#### Payload

```javascript
{
  order_id: "",
  transaction: {...}
}
```

---

### shippo.transaction_updated.payload

Triggered when the `transaction_updated` webhook receives an updated transaction

#### Payload

```javascript
{
  order_id: "",
  fulfillment_id: "",
  transaction: {...}
}
```

---

### shippo.track_updated.payload

Triggered when the `track_updated` webhook receives an updated track

#### Payload

```javascript
{
  ...track
}
```

---

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
const client = shippoService.client

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

## Shipping Rates

Dimensional weight is a major factor in determining costs. Estimates are frivolous when based on inaccurate parcel volume and weight. This raises a challenging problem in computing which parcel box to use. While this is simple for single items, it becomes increasingly difficult when packing multiple items of various dimensions. It is a classic [bin packing problem](https://en.wikipedia.org/wiki/Bin_packing_problem), [NP-Hard](https://en.wikipedia.org/wiki/NP-hardness) stuff.

This plugin uses [binpackingjs](https://github.com/olragon/binpackingjs) which provides a [first-fit](https://en.wikipedia.org/wiki/First-fit_bin_packing) algorithm. Additional logic is wrapped around it to get a more optimized [first-fit-decreasing](https://en.wikipedia.org/wiki/First-fit-decreasing_bin_packing) algorithm. In order for this to be effective, parcel templates need to be setup in the Shippo account, and all products in medusa must have values for length, width, height, and weight.

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
