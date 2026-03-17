#!/bin/bash
# Patches: 1) Reuse app's Supabase client  2) Deferred announce (wait for SUBSCRIBED)
#          3) try/catch in announce  4) didUnsub guard on error resubscription
FILE="node_modules/trystero/src/supabase.js"
[ ! -f "$FILE" ] && exit 0

cat > "$FILE" << 'PATCH'
import {createClient} from '@supabase/supabase-js'
import strategy from './strategy.js'
import {selfId} from './utils.js'

const events = { broadcast: 'broadcast', join: 'join', sdp: 'sdp' }

export const joinRoom = strategy({
  init: config => config._client || createClient(config.appId, config.supabaseKey),

  subscribe: (client, rootTopic, selfTopic, onMessage) => {
    const allChans = []
    let didUnsub = false
    let initSubscribedCount = 0
    let resolveReady
    const readyPromise = new Promise(r => { resolveReady = r })

    const subscribe = (topic, cb, isInit) => {
      const chan = client.channel(topic)
      chan.subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          if (didUnsub) { client.removeChannel(chan); return }
          allChans.push(chan)
          cb(chan)
          if (isInit && ++initSubscribedCount >= 2) resolveReady()
          return
        }
        if (status === 'CLOSED') return
        if (!didUnsub) {
          await client.removeChannel(chan)
          setTimeout(() => subscribe(topic, cb, isInit), 999)
        }
      })
    }

    const handleMessage = (peerTopic, signal) =>
      subscribe(peerTopic, chan => chan.send({ type: events.broadcast, event: events.sdp, payload: signal }))

    subscribe(selfTopic, chan =>
      chan.on(events.broadcast, {event: events.sdp}, ({payload}) => onMessage(selfTopic, payload, handleMessage)), true)

    subscribe(rootTopic, chan =>
      chan.on(events.broadcast, {event: events.join}, ({payload}) => onMessage(rootTopic, payload, handleMessage)), true)

    return readyPromise.then(() => () => {
      didUnsub = true
      allChans.forEach(chan => client.removeChannel(chan))
    })
  },

  announce: (client, rootTopic) => {
    try {
      return client.channel(rootTopic).send({ type: events.broadcast, event: events.join, payload: {peerId: selfId} })
    } catch (e) { console.warn('[Trystero] announce failed, will retry:', e) }
  }
})

export {selfId} from './utils.js'
PATCH
echo "Patched trystero supabase strategy"
