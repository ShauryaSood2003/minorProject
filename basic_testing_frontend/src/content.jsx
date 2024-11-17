import './index.css'

import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import MultipleSidebarChatbots from './MultipleSidebarChatbots'

const root = document.createElement('div')
root.id = '__ai_chatbot_assistant_container'
document.body.append(root)

createRoot(root).render(
  <StrictMode>
  {(true) ? < MultipleSidebarChatbots/> : <></>}
  </StrictMode>
)