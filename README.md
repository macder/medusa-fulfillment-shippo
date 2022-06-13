## medusa-fulfillment-shippo

Adds [Shippo](https://goshippo.com/) as a fulfillment provider in [Medusa](https://medusajs.com/)

Medusa is an open-source headless commerce engine that enables developers to create amazing digital commerce experiences.

**Still in dev phase. Expect an npm release soon**

## Current Feature Overview

*   Carrier service level fulfillment options
*   Service group fulfillment options
*   Rates at checkout
*   Fulfillments create new Shippo order

## Getting started

*   WIP

## Feature Details

### Fulfilment Options

Adds Fulfilment option for each service level provided by active carriers in your Shippo account. These will be available when an admin is creating shipping options for regions, profiles, etc.

### Service Groups

WIP

### Rates at Checkout

Live shipping rates for carts at checkout

There are some preliminary setup steps before using this feature. Follow the guide to get started:

**Step 1 - Setup Shipping Options in Shippo App**

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

**Step 2 - Assign the Shipping Options to Regions in Medusa**

Query the admin api to get a list of fulfillment options available to the region ([API reference](https://docs.medusajs.com/api/admin/region/list-fulfillment-options-available-in-the-region))

`GET http://localhost:9000/admin/regions/[REGION_ID]/fulfillment-options`

The response should have, among others, the shipping options you created in the Shippo App from step 1

```plaintext
{
  "fulfillment_options": [
    {
      "provider_id": "shippo",
      "options": [
        {
          "id": "shippo-fulfillment-[OBJECT_ID]",
          "is_group": true,
          "description": "5 - 9 days",
          "flat_rate": "10",
          "flat_rate_currency": "CAD",
          "free_shipping_threshold_currency": null,
          "free_shipping_threshold_min": null,
          "is_active": true,
          "name": "Express Shipping Canada",
          "object_id": "[OBJECT_ID]",
          "rate_adjustment": 0,
          "service_levels": [
            {
              "account_object_id": "[OBJECT_ID]",
              "service_level_token": "canada_post_xpresspost"
            }
          ],
          "type": "LIVE_RATE"
        }
      ]
    }
  ]
}
```

WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP 

### Create Shippo Order

A new Shippo order is created when an admin creates a fulfilment. The shipping method and its price at checkout is attached to the Shippo order.

## Planned Features

*   Returns
*   Customs for international orders
*   Swaps (exchanges)

## Resources

Medusa Docs  
https://docs.medusajs.com/

Medusa Shipping Architecture:  
https://docs.medusajs.com/advanced/backend/shipping/overview

Shippo API  
https://goshippo.com/docs/intro  
https://goshippo.com/docs/reference