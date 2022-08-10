export const carrierAccountState = () => [
  {
    carrier: "usps",
    carrier_name: "USPS",
    service_levels: [
      {
        token: "usps_first",
        name: "FC Package",
        supports_return_labels: true,
      },
      {
        token: "usps_priority",
        name: "Priority",
        supports_return_labels: true,
      },
    ],
  },
  {
    carrier: "canada_post",
    carrier_name: "Canada Post",
    service_levels: [
      {
        token: "canada_post_xpresspost",
        name: "Xpresspost",
      },
      {
        token: "canada_post_priority",
        name: "Priority",
      },
    ],
  },
  {
    carrier: "fed_ex",
    carrier_name: "Fed Ex",
    active: false,
    service_levels: [
      {
        token: "fed_ex_fast",
        name: "Fast",
      },
    ],
  },
]
