import { noise } from '@chainsafe/libp2p-noise'
import { type DualKadDHT, kadDHT } from '@libp2p/kad-dht'
import { mplex } from '@libp2p/mplex'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { tcp } from '@libp2p/tcp'
// @ts-expect-error no types
import defaultsDeep from '@nodeutils/defaults-deep'
import { createLibp2p, type Libp2pOptions } from 'libp2p'
import { identifyService } from 'libp2p/identify'
import type { Libp2p, ServiceMap } from '@libp2p/interface'

export interface NodeOptions extends Libp2pOptions {
  DHT?: boolean
}

export async function createLibp2pNode (options: NodeOptions = {}): Promise<Libp2p<{ dht: DualKadDHT }>> {
  const services: ServiceMap = {
    identify: identifyService()
  }

  if (options.DHT === true) {
    services.dht = kadDHT({
      clientMode: false
    })
  }

  const node = await createLibp2p<{ dht: DualKadDHT }>(defaultsDeep({
    peerId: await createEd25519PeerId(),
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [
      tcp()
    ],
    streamMuxers: [
      mplex()
    ],
    connectionEncryption: [
      noise()
    ],
    services
  }, options))

  await node.start()

  return node
}
