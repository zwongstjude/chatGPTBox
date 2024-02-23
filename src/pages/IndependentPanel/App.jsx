import {
  createSession,
  resetSessions,
  getSessions,
  updateSession,
  getSession,
  deleteSession,
} from '../../services/local-session.mjs'
import { useEffect, useRef, useState } from 'react'
import './styles.scss'
import { useConfig } from '../../hooks/use-config.mjs'
import { useTranslation } from 'react-i18next'
import ConfirmButton from '../../components/ConfirmButton'
import ConversationCard from '../../components/ConversationCard'
import DeleteButton from '../../components/DeleteButton'
import { openUrl } from '../../utils/index.mjs'
import Browser from 'webextension-polyfill'
import FileSaver from 'file-saver'

const templateConfig = [
  {
     "id":0,
     "label":"Outline",
     "message":"Write an outline for a "
  },
  {
     "id":1,
     "label":"Bullet list",
     "message":"Write a bullet list of "
  },
  {
     "id":2,
     "label":"Headline",
     "message":"Write a bullet list of "
  },
  {
     "id":3,
     "label":"Paragraph",
     "message":"Write a paragraph about "
  },
  {
     "id":4,
     "label":"Sentence",
     "message":"Write a sentence about "
  },
  {
     "id":5,
     "label":"Brainstorm ideas",
     "message":"Give me a few ideas for "
  },
  {
     "id":6,
     "label":"Email",
     "message":"Write an email about "
  },
  {
     "id":7,
     "label":"Letter (formal)",
     "message":"Write a formal letter about "
  },
  {
     "id":8,
     "label":"Social post..",
     "message":"Write a social media post about "
  },
  {
     "id":10,
     "label":"A couple paragraphs",
     "message":"Write a couple paragraphs about "
  },
  {
     "id":11,
     "label":"Advertisement",
     "message":"Write an advertising headline and subheadline for a "
  },
  {
     "id":12,
     "label":"Outline for a blog post",
     "message":"Write an outline for a blog post about "
  },
  {
     "id":13,
     "label":"Blog post section",
     "message":"Write a blog post section about "
  },
  {
     "id":14,
     "label":"Website section",
     "message":"Write a website section about "
  },
  {
     "id":15,
     "label":"Information about",
     "message":"Give me some information about "
  },
  {
     "id":16,
     "label":"Letter (job application)",
     "message":"Write a job application letter applying to a position for a "
  }
]

function App() {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(true)
  const config = useConfig(null, false)
  const [sessions, setSessions] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [currentSession, setCurrentSession] = useState(null)
  const [renderContent, setRenderContent] = useState(false)
  const currentPort = useRef(null)

  const setSessionIdSafe = async (sessionId) => {
    if (currentPort.current) {
      try {
        currentPort.current.postMessage({ stop: true })
        currentPort.current.disconnect()
      } catch (e) {
        /* empty */
      }
      currentPort.current = null
    }
    const { session, currentSessions } = await getSession(sessionId)
    if (session) setSessionId(sessionId)
    else if (currentSessions.length > 0) setSessionId(currentSessions[0].sessionId)
  }

  useEffect(() => {
    document.documentElement.dataset.theme = config.themeMode
  }, [config.themeMode])

  useEffect(() => {
    // eslint-disable-next-line
    ;(async () => {
      const sessions = await getSessions()
      if (sessions[0].conversationRecords && sessions[0].conversationRecords.length > 0) {
        await createNewChat()
      } else {
        setSessions(sessions)
        await setSessionIdSafe(sessions[0].sessionId)
      }
    })()
  }, [])

  useEffect(() => {
    if ('sessions' in config && config['sessions']) setSessions(config['sessions'])
  }, [config])

  useEffect(() => {
    // eslint-disable-next-line
    ;(async () => {
      if (sessions.length > 0) {
        setCurrentSession((await getSession(sessionId)).session)
        setRenderContent(false)
        setTimeout(() => {
          setRenderContent(true)
        })
      }
    })()
  }, [sessionId])

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const createNewChat = async () => {
    const { session, currentSessions } = await createSession()
    setSessions(currentSessions)
    await setSessionIdSafe(session.sessionId)
  }

  const exportConversations = async () => {
    const sessions = await getSessions()
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'text/json;charset=utf-8' })
    FileSaver.saveAs(blob, 'conversations.json')
  }

  const clearConversations = async () => {
    const sessions = await resetSessions()
    setSessions(sessions)
    await setSessionIdSafe(sessions[0].sessionId)
  }

  const appendTemplate = async (id) => {
    let ele = document.querySelector(
      '#app > div > div > div.chat-content > div > div > div.input-box > div > textarea',
    );
    ele.value = templateConfig[id].message
    ele.focus()
  }

  return (
    <div className="IndependentPanel">
      <div className="chat-container">
        <div className={`chat-sidebar ${collapsed ? 'collapsed' : ''}`}>
          <div className="chat-sidebar-button-group">
            <button className="normal-button" onClick={toggleSidebar}>
              {collapsed ? t('Pin') : t('Unpin')}
            </button>
            <button className="normal-button" onClick={createNewChat}>
              {t('New Chat')}
            </button>
            <button className="normal-button" onClick={exportConversations}>
              {t('Export')}
            </button>
          </div>
          <hr />
          <div className="chat-list">
            {sessions.map(
              (
                session,
                index, // TODO editable session name
              ) => (
                <button
                  key={index}
                  className={`normal-button ${sessionId === session.sessionId ? 'active' : ''}`}
                  style="display: flex; align-items: center; justify-content: space-between;"
                  onClick={() => {
                    setSessionIdSafe(session.sessionId)
                  }}
                >
                  {session.sessionName}
                  <span className="gpt-util-group">
                    <DeleteButton
                      size={14}
                      text={t('Delete Conversation')}
                      onConfirm={() =>
                        deleteSession(session.sessionId).then((sessions) => {
                          setSessions(sessions)
                          setSessionIdSafe(sessions[0].sessionId)
                        })
                      }
                    />
                  </span>
                </button>
              ),
            )}
          </div>
          <div className="prompt-template-group">
            {templateConfig.map((key) => (
              <button
                onClick={() => {
                  appendTemplate(key.id)
                }}
              >
                {t(key.label)}
              </button>
            ))}
          </div>
          <hr />
          <div className="chat-sidebar-button-group">
            <ConfirmButton text={t('Clear conversations')} onConfirm={clearConversations} />
            <button
              className="normal-button"
              onClick={() => {
                openUrl(Browser.runtime.getURL('popup.html'))
              }}
            >
              {t('Settings')}
            </button>
          </div>
        </div>
        <div className="chat-content">
          {renderContent && currentSession && currentSession.conversationRecords && (
            <div className="chatgptbox-container" style="height:100%;">
              <ConversationCard
                session={currentSession}
                notClampSize={true}
                pageMode={true}
                onUpdate={(port, session, cData) => {
                  currentPort.current = port
                  if (cData.length > 0 && cData[cData.length - 1].done) {
                    updateSession(session).then(setSessions)
                    setCurrentSession(session)
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
