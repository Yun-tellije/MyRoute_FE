<template>
  <div class="chatbot-container">
    <button class="toggle-btn" @click="toggleChat">
      <img v-if="!isOpen" src="/resource/chatbot-icon.png" alt="챗봇 아이콘" class="chatbot-icon" />
      <img v-else src="/resource/chatbot-icon-close.png" class="chatbot-icon-close" />
    </button>

    <div v-if="isOpen" class="chat-window shadow d-flex flex-column">
      <div class="chat-header d-flex justify-content-between align-items-center px-3 py-2">
        <strong>루티와 채팅 중</strong>
        <button class="btn-close" @click="isOpen = false"></button>
      </div>

      <div class="chat-body flex-grow-1 d-flex flex-column px-3 py-2">
        <!-- 여행 유형 선택 -->
        <div class="mb-2">
          <label class="form-label fw-bold small">👤 여행 유형 선택</label>
          <select v-model="userType" class="form-select form-select-sm">
            <option value="가족">👨‍👩‍👧‍👦 가족</option>
            <option value="커플">💑 커플</option>
            <option value="혼자">🧍 혼자</option>
          </select>
        </div>

        <!-- 채팅 메시지 -->
        <div ref="chatContainer" class="chat-messages flex-grow-1 overflow-auto">
          <div v-for="(msg, index) in messages" :key="index" :class="['chat-bubble', msg.sender]">
            <div>{{ msg.text }}</div>
            <div class="timestamp">{{ msg.time }}</div>
          </div>
        </div>
      </div>

      <!-- 입력 -->
      <div class="chat-input p-3 border-top">
        <textarea
          v-model="input"
          class="form-control mb-2"
          rows="2"
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
const userType = ref('가족') // 👈 여행 유형 기본값
const messages = ref([])
const loading = ref(false)
const chatContainer = ref(null)

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

const send = async () => {
  const trimmed = input.value.trim()
  if (!trimmed) return

  messages.value.push({ sender: 'user', text: trimmed, time: nowTime() })
  input.value = ''
  scrollToBottom()
  loading.value = true

  try {
    const isCourseQuestion =
      trimmed.includes('코스') || trimmed.includes('일정') || trimmed.includes('추천')
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
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 80px;
  right: 40px;
  z-index: 9999;
}

.toggle-btn {
  background-color: transparent;
  border: none;
  cursor: pointer;
  width: 60px;
  height: 60px;
  position: relative;
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
  width: 320px;
  height: 520px;
  background: #ffffff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
}

.chat-header {
  background-color: #9dbbaa;
  color: white;
  font-size: 1rem;
  font-weight: 500;
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
</style>
