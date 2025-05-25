<template>
  <div class="chatbot-container">
    <button class="toggle-btn" @click="toggleChat">
      <img v-if="!isOpen" src="/resource/chatbot-icon.png" alt="챗봇 아이콘" class="chatbot-icon" />
      <img v-else src="/resource/chatbot-icon-close.png" class="chatbot-icon-close" />
      <span v-if="!isOpen && showHint" class="chat-hint-bubble"
        ><i class="fa-regular fa-comment fa-flip-horizontal"></i> 저에게 물어보세요!</span
      >
    </button>

    <div v-if="isOpen" class="chat-window shadow d-flex flex-column">
      <div class="chat-header d-flex justify-content-between align-items-center px-3 py-2">
        <strong>루티와 채팅 중</strong>
        <button class="btn-close" @click="isOpen = false"></button>
      </div>

      <div class="chat-body flex-grow-1 d-flex flex-column px-3 py-2">
        <div v-if="suggestedPlace" class="suggestion-float-button" @click="useSuggestion">
          '{{ suggestedPlace }}' 검색하기
        </div>

        <div class="mb-2">
          <label class="form-label fw-bold small">여행 유형 선택</label>
          <select v-model="userType" class="form-select form-select-sm">
            <option value="가족">👨‍👩‍👧‍👦 가족</option>
            <option value="커플">💑 커플</option>
            <option value="혼자">🧍 혼자</option>
            <option value="친구">👭 친구</option>
          </select>
        </div>
        <!-- <hr style="margin: 5px 0" /> -->

        <div ref="chatContainer" class="chat-messages flex-grow-1 overflow-auto">
          <div v-for="(msg, index) in messages" :key="index" :class="['chat-bubble', msg.sender]">
            <div v-html="formatText(msg.text)" class="chat-content"></div>
            <div class="timestamp">{{ msg.time }}</div>
          </div>
        </div>
      </div>

      <div class="chat-input p-3 border-top">
        <textarea
          v-model="input"
          class="form-control mb-2"
          rows="1"
          placeholder="궁금한 내용을 입력해보세요"
          @keyup.enter="send"
        />
        <button class="btn w-100 rounded-pill" :disabled="loading" @click="send">
          {{ loading ? '루티가 작성 중...' : '전송' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import axios from 'axios'

const isOpen = ref(false)
const input = ref('')
const userType = ref('가족')
const messages = ref([])
const loading = ref(false)
const chatContainer = ref(null)
const suggestedPlace = ref('')
const showHint = ref(false)

const nowTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && messages.value.length === 0) {
    messages.value.push({
      sender: 'bot',
      text: '안녕하세요 루티입니다 :) 궁금한 장소나 추천 경로를 물어보세요!',
      time: nowTime(),
    })
    scrollToBottom()
  }
}

const useSuggestion = () => {
  input.value = suggestedPlace.value
  suggestedPlace.value = ''
}

const send = async () => {
  const trimmed = input.value.trim()
  if (!trimmed) return

  messages.value.push({ sender: 'user', text: trimmed, time: nowTime() })
  input.value = ''
  suggestedPlace.value = ''
  scrollToBottom()
  loading.value = true

  try {
    const lower = trimmed.toLowerCase()
    const isCourseQuestion =
      lower.includes('코스') || lower.includes('일정') || lower.includes('추천')

    let res
    if (isCourseQuestion) {
      res = await axios.post('/api/ai/recommend-course', {
        area: trimmed,
        days: '2',
        userType: userType.value,
      })
    } else {
      res = await axios.post('/api/ai/generate-description', {
        title: trimmed,
      })
    }

    messages.value.push({ sender: 'bot', text: res.data, time: nowTime() })
  } catch (err) {
    messages.value.push({ sender: 'bot', text: '❌ 오류: ' + err.message, time: nowTime() })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const formatText = (text) => {
  return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

let suggestionTimer = null
window.suggestPlaceToChatbot = (title) => {
  suggestedPlace.value = title
  showHint.value = true
  clearTimeout(suggestionTimer)
  suggestionTimer = setTimeout(() => {
    showHint.value = false
  }, 5000)
}
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 80px;
  right: 40px;
  z-index: 1;
}

.toggle-btn {
  background-color: transparent;
  border: none;
  cursor: pointer;
  width: 60px;
  height: 60px;
  position: relative;
}

.chat-hint-bubble {
  position: absolute;
  top: -10px;
  left: -140px;
  background: #fff9c4;
  color: #444;
  font-size: 0.8rem;
  padding: 6px 10px;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  animation: fade-slide-in 0.6s ease-out;
  border: 1px solid #fce38a;
  font-weight: 500;
}

@keyframes fade-slide-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chatbot-icon,
.chatbot-icon-close {
  width: 150%;
  height: auto;
  border-radius: 50%;
  box-shadow: 3px 5px 20px rgba(0, 0, 0, 0.25);
}

.chat-window {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 390px;
  height: 600px;
  background: #ffffff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.chat-header {
  background-color: #9dbbaa;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.chat-body {
  font-size: 0.9rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
}

.chat-bubble {
  max-width: 80%;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  word-wrap: break-word;
  line-height: 1.4;
  animation: fadeIn 0.3s ease-in-out;
  position: relative;
}

.chat-bubble.user {
  align-self: flex-end;
  background-color: #e8f0fe;
}

.chat-bubble.bot {
  align-self: flex-start;
  background-color: #f1f5f3;
  text-align: left;
}

.chat-content {
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
}

.timestamp {
  font-size: 0.7rem;
  color: gray;
  text-align: right;
  margin-top: 0.25rem;
}

textarea {
  resize: none;
}

.btn {
  background-color: #9dbbaa;
  color: white;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-float-button {
  position: absolute;
  bottom: 130px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff9c4;
  color: #333;
  padding: 6px 14px;
  font-size: 0.75rem;
  border-radius: 20px;
  border: 1px solid #fce38a;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  white-space: nowrap;
  z-index: 10000;
  animation: fade-slide-up 0.5s ease-out;
}

@keyframes fade-slide-up {
  from {
    opacity: 0;
    transform: translate(-50%, 8px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
