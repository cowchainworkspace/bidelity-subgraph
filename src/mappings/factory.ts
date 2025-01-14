/* eslint-disable prefer-const */
import { log } from '@graphprotocol/graph-ts'
import { PairCreated, SetSwapFeeBPCall, LockCall, UnlockCall } from '../types/Factory/Factory'
import { Bundle, Pair, Token, BidelityFactory } from '../types/schema'
import { Pair as PairTemplate } from '../types/templates'
import {
  FACTORY_ADDRESS,
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
  fetchTokenTotalSupply,
  ZERO_BD,
  ZERO_BI,
  factoryContract
} from './helpers'

function loadFactory(): BidelityFactory {
  let factory = BidelityFactory.load(FACTORY_ADDRESS)
  if (factory === null) {
    factory = new BidelityFactory(FACTORY_ADDRESS)
    factory.pairCount = 0
    factory.totalVolumeETH = ZERO_BD
    factory.totalLiquidityETH = ZERO_BD
    factory.totalVolumeUSD = ZERO_BD
    factory.untrackedVolumeUSD = ZERO_BD
    factory.totalLiquidityUSD = ZERO_BD
    factory.txCount = ZERO_BI

    factory.swapFeeBP = factoryContract.swapFeeBP()
    factory.removeLiquidityFeeBP = factoryContract.removeLiquidityFeeBP()
    factory.addLiquidityFeeBP = factoryContract.addLiquidityFeeBP()

    // create new bundle
    let bundle = new Bundle('1')
    bundle.ethPrice = ZERO_BD
    bundle.save()
  }
  factory.pairCount = factory.pairCount + 1
  factory.save()
  return factory as BidelityFactory
}

export function handleNewPair(event: PairCreated): void {
  // load factory (create if first exchange)
  let factory = BidelityFactory.load(FACTORY_ADDRESS)
  if (factory === null) {
    factory = new BidelityFactory(FACTORY_ADDRESS)
    factory.pairCount = 0
    factory.totalVolumeETH = ZERO_BD
    factory.totalLiquidityETH = ZERO_BD
    factory.totalVolumeUSD = ZERO_BD
    factory.untrackedVolumeUSD = ZERO_BD
    factory.totalLiquidityUSD = ZERO_BD
    factory.txCount = ZERO_BI

    factory.swapFeeBP = factoryContract.swapFeeBP()
    factory.removeLiquidityFeeBP = factoryContract.removeLiquidityFeeBP()
    factory.addLiquidityFeeBP = factoryContract.addLiquidityFeeBP()

    // create new bundle
    let bundle = new Bundle('1')
    bundle.ethPrice = ZERO_BD
    bundle.save()
  }
  factory.pairCount = factory.pairCount + 1
  factory.save()

  // create the tokens
  let token0 = Token.load(event.params.token0.toHexString())
  let token1 = Token.load(event.params.token1.toHexString())

  // fetch info if null
  if (token0 === null) {
    token0 = new Token(event.params.token0.toHexString())
    token0.symbol = fetchTokenSymbol(event.params.token0)
    token0.name = fetchTokenName(event.params.token0)
    token0.totalSupply = fetchTokenTotalSupply(event.params.token0)
    let decimals = fetchTokenDecimals(event.params.token0)

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return
    }

    token0.decimals = decimals
    token0.derivedETH = ZERO_BD
    token0.tradeVolume = ZERO_BD
    token0.tradeVolumeUSD = ZERO_BD
    token0.untrackedVolumeUSD = ZERO_BD
    token0.totalLiquidity = ZERO_BD
    // token0.allPairs = []
    token0.txCount = ZERO_BI
  }

  // fetch info if null
  if (token1 === null) {
    token1 = new Token(event.params.token1.toHexString())
    token1.symbol = fetchTokenSymbol(event.params.token1)
    token1.name = fetchTokenName(event.params.token1)
    token1.totalSupply = fetchTokenTotalSupply(event.params.token1)
    let decimals = fetchTokenDecimals(event.params.token1)

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      return
    }
    token1.decimals = decimals
    token1.derivedETH = ZERO_BD
    token1.tradeVolume = ZERO_BD
    token1.tradeVolumeUSD = ZERO_BD
    token1.untrackedVolumeUSD = ZERO_BD
    token1.totalLiquidity = ZERO_BD
    // token1.allPairs = []
    token1.txCount = ZERO_BI
  }

  let pair = new Pair(event.params.pair.toHexString()) as Pair
  pair.token0 = token0.id
  pair.token1 = token1.id
  pair.liquidityProviderCount = ZERO_BI
  pair.createdAtTimestamp = event.block.timestamp
  pair.createdAtBlockNumber = event.block.number
  pair.txCount = ZERO_BI
  pair.swapsAmount = ZERO_BI
  pair.reserve0 = ZERO_BD
  pair.reserve1 = ZERO_BD
  pair.trackedReserveETH = ZERO_BD
  pair.reserveETH = ZERO_BD
  pair.reserveUSD = ZERO_BD
  pair.totalSupply = ZERO_BD
  pair.burned = ZERO_BD
  pair.issued = ZERO_BD
  pair.volumeToken0 = ZERO_BD
  pair.volumeToken1 = ZERO_BD
  pair.volumeUSD = ZERO_BD
  pair.untrackedVolumeUSD = ZERO_BD
  pair.token0Price = ZERO_BD
  pair.token1Price = ZERO_BD
  pair.bidelityProfit = ZERO_BD

  // create the tracked contract based on the template
  PairTemplate.create(event.params.pair)

  // save updated values
  token0.save()
  token1.save()
  pair.save()
}

export function handlerSetSwapFeeBP(call: SetSwapFeeBPCall): void {
  const factory = loadFactory()
  factory.swapFeeBP = call.inputs.value
  factory.save()
}

export function handlerSetRemoveLiquidityFeeBP(call: SetSwapFeeBPCall): void {
  const factory = loadFactory()
  factory.removeLiquidityFeeBP = call.inputs.value
  factory.save()
}

export function handlerSetAddLiquidityFeeBP(call: SetSwapFeeBPCall): void {
  const factory = loadFactory()
  factory.addLiquidityFeeBP = call.inputs.value
  factory.save()
}


export function handlerLock(call: LockCall): void {
  const pair = Pair.load(call.inputs.pool.toHexString()) as Pair;

  pair.lock = true;
  pair.save()
}

export function handlerUnlock(call: LockCall): void {
  const pair = Pair.load(call.inputs.pool.toHexString()) as Pair;

  pair.lock = false;
  pair.save()
}
