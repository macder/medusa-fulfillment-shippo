import { claimSchema } from "../claim"
import { returnSchema } from "./schema"

export const returnStub = ({ ...state }) =>
  returnSchema({
    ...state,
    claim_order: state?.claim_order
      ? claimSchema({ ...state.claim_order })
      : null,
  })
