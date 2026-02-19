import { useMemo, useState } from 'react'

function ChatbotPanel({ onAskBot }) {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: 'Hello! I can answer quick enrollment and schedule questions.',
    },
  ])
  const [typing, setTyping] = useState(false)

  const canSend = useMemo(() => prompt.trim().length > 0 && !typing, [prompt, typing])

  const handleSend = async (event) => {
    event.preventDefault()
    if (!canSend) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: prompt.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setPrompt('')
    setTyping(true)

    const reply = await onAskBot(userMessage.text)

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        role: 'bot',
        text: reply,
      },
    ])

    setTyping(false)
  }

  return (
    <article className="panel chatbot-panel">
      <div className="panel-header">
        <h3>Enrollment Assistant</h3>
        <p>Prototype chatbot (mock AI service)</p>
      </div>

      <div className="chat-stream">
        {messages.map((message) => (
          <div key={message.id} className={`chat-bubble ${message.role}`}>
            {message.text}
          </div>
        ))}
        {typing && <div className="chat-bubble bot">Typing a response...</div>}
      </div>

      <form className="chat-form" onSubmit={handleSend}>
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask about enrollment, classes, or deadlines..."
        />
        <button type="submit" disabled={!canSend}>
          Send
        </button>
      </form>
    </article>
  )
}

export default ChatbotPanel