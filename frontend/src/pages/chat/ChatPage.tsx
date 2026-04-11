import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { chat as chatApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { User, Message } from '../../types'
import './ChatPage.css'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function ChatPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [contacts, setContacts]       = useState<User[]>([])
  const [active, setActive]           = useState<User | null>(null)
  const [messages, setMessages]       = useState<Message[]>([])
  const [text, setText]               = useState('')
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending]         = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    chatApi.getContacts(user.id)
      .then(data => { setContacts(data); setLoadingContacts(false) })
      .catch(() => setLoadingContacts(false))
  }, [user, navigate])

  useEffect(() => {
    if (!user || !active) return
    setLoadingMessages(true)
    chatApi.getConversation(user.id, active.id)
      .then(data => { setMessages(data); setLoadingMessages(false) })
      .catch(() => setLoadingMessages(false))
  }, [user, active])

  // scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!user || !active || !text.trim()) return
    const content = text.trim()
    setText('')
    setSending(true)
    try {
      await chatApi.send(user.id, active.id, content)
      const updated = await chatApi.getConversation(user.id, active.id)
      setMessages(updated)
    } catch { /* ignore */ } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="chat-page">

      {/* Contacts pane */}
      <aside className="chat-contacts">
        <div className="chat-contacts-header">Messages</div>
        {loadingContacts ? (
          <div className="loading" style={{ minHeight: 80 }}><div className="spinner" /></div>
        ) : contacts.length === 0 ? (
          <div className="chat-contacts-empty">No conversations yet.</div>
        ) : (
          contacts.map(c => (
            <button
              key={c.id}
              className={`chat-contact ${active?.id === c.id ? 'active' : ''}`}
              onClick={() => setActive(c)}
            >
              <div className="chat-contact-avatar">{c.email[0].toUpperCase()}</div>
              <div className="chat-contact-email">{c.email}</div>
            </button>
          ))
        )}
      </aside>

      {/* Conversation pane */}
      <div className="chat-conversation">
        {!active ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <p>Select a contact to start messaging</p>
          </div>
        ) : (
          <>
            <div className="chat-conv-header">
              <div className="chat-contact-avatar" style={{ width: 30, height: 30, fontSize: 13 }}>
                {active.email[0].toUpperCase()}
              </div>
              <span className="chat-conv-email">{active.email}</span>
            </div>

            <div className="chat-messages">
              {loadingMessages ? (
                <div className="loading"><div className="spinner" /></div>
              ) : messages.length === 0 ? (
                <div className="chat-no-messages">No messages yet. Say hello!</div>
              ) : (
                messages.map(m => {
                  const isOwn = m.senderId === user?.id
                  return (
                    <div key={m.id} className={`chat-message ${isOwn ? 'own' : 'other'}`}>
                      <div className="chat-bubble">{m.content}</div>
                      <div className="chat-time">{formatTime(m.createdAt)}</div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-row">
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message…"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSend}
                disabled={sending || !text.trim()}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
