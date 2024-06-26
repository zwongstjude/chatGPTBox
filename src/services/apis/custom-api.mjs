// custom api version

// There is a lot of duplicated code here, but it is very easy to refactor.
// The current state is mainly convenient for making targeted changes at any time,
// and it has not yet had a negative impact on maintenance.
// If necessary, I will refactor.

import { getUserConfig } from '../../config/index.mjs'
import { fetchSSE } from '../../utils/fetch-sse.mjs'
import { getConversationPairs } from '../../utils/get-conversation-pairs.mjs'
import { isEmpty } from 'lodash-es'
import { pushRecord, setAbortController } from './shared.mjs'

/**
 * @param {Browser.Runtime.Port} port
 * @param {string} question
 * @param {Session} session
 * @param {string} apiKey
 * @param {string} modelName
 */
export async function generateAnswersWithCustomApi(port, question, session, apiKey, modelName) {
  const { controller, messageListener, disconnectListener } = setAbortController(port)

  const config = await getUserConfig()
  const prompt = getConversationPairs(
    session.conversationRecords.slice(-config.maxConversationContextLength),
    false,
  )
  //prompt.unshift({ role: 'system', content: await getCustomApiPromptBase() })
  prompt.push({ role: 'user', content: question })
  const apiUrl = config.customModelApiUrl

  let answer = ''
  await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Cnvrg-Api-Key': `${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input_params: question,
    }),
    // onMessage(message) {
    //   console.debug('sse message', message)
    //   if (message.trim() === '[DONE]') {
    //     pushRecord(session, question, answer)
    //     console.debug('conversation history', { content: session.conversationRecords })
    //     return
    //   }
    //   let data
    //   try {
    //     data = JSON.parse(message)
    //   } catch (error) {
    //     console.debug('json error', error)
    //     return
    //   }

    //   if (data.response) answer = data.response
    //   else
    //     answer +=
    //       data.choices[0]?.delta?.content ||
    //       data.choices[0]?.message?.content ||
    //       data.choices[0]?.text ||
    //       ''
    //   port.postMessage({ answer: answer, done: true, session: null })

    //   port.postMessage({ done: true })
    //   port.onMessage.removeListener(messageListener)
    //   port.onDisconnect.removeListener(disconnectListener)
    // },
    // async onStart() {},
    // async onEnd() {
    //   port.postMessage({ done: true })
    //   port.onMessage.removeListener(messageListener)
    //   port.onDisconnect.removeListener(disconnectListener)
    // },
    // async onError(resp) {
    //   port.onMessage.removeListener(messageListener)
    //   port.onDisconnect.removeListener(disconnectListener)
    //   if (resp instanceof Error) throw resp
    //   const error = await resp.json().catch(() => ({}))
    //   throw new Error(!isEmpty(error) ? JSON.stringify(error) : `${resp.status} ${resp.statusText}`)
    // },
  })
    .then((r) => r.text())
    .then((result) => {
      console.log(result)
      let response = JSON.parse(result).prediction
      response = response.replace(/.*\<\|assistant\|\>/gs, '')
      console.log(response)
      port.postMessage({ answer: response, done: true, session: null })

      port.postMessage({ done: true })
      port.onMessage.removeListener(messageListener)
      port.onDisconnect.removeListener(disconnectListener)
    })
}
