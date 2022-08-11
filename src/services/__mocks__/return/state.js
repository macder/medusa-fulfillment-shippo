const baseState = () => ({
  id: "return_default",
  order_id: "order_default",
  swap_id: null,
  claim_order_id: null,
  swap: null,
  claim_order: null,
})

export const returnState = ({ id, claim_order_id = null, swap_id = null }) => ({
  claim: {
    replace: {
      ...baseState(),
      id,
      claim_order_id,
      claim_order: {
        id: claim_order_id,
        type: "replace",
        order_id: baseState().order_id,
      },
    },
  },
})
