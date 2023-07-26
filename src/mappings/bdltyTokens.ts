import { BdltyTokens } from '../types/schema'
import { BurnCall, MintCall } from '../types/BdltyTokens/BdltyTokens'
import { ZERO_BI } from './helpers'

export const BDLTY_ADDRESS = '0x43981ff140dF790BEfe60EE2e721b67aF4c114F4'

export function loadBdltyToken(): BdltyTokens {
  let token = BdltyTokens.load(BDLTY_ADDRESS)

  if (token === null) {
    token = new BdltyTokens(BDLTY_ADDRESS)
    token.burned = ZERO_BI
    token.issued = ZERO_BI
  }

  return token
}

export function burn(call: BurnCall): void {
  const token = loadBdltyToken()

  token.burned = token.burned.plus(call.inputs.amount)

  token.save()
}

export function mint(call: MintCall): void {
  const token = loadBdltyToken()
  token.issued = token.issued.plus(call.inputs.amount)

  token.save()
}
