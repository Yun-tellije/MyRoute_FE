<template>
  <div class="notice-write-container">
    <h1 class="page-title">공지사항 등록</h1>
    <form @submit.prevent="submitNotice" class="notice-form">
      <div class="form-group">
        <label for="title" class="form-label">제목</label>
        <input
          type="text"
          id="title"
          v-model="notice.title"
          class="form-control"
          required
          placeholder="제목을 입력하세요"
        />
      </div>
      <div class="form-group">
        <label for="content" class="form-label">내용</label>
        <textarea
          id="content"
          v-model="notice.content"
          class="form-control textarea"
          rows="10"
          required
          placeholder="내용을 입력하세요"
        ></textarea>
      </div>
      <div class="btn-wrap">
        <button type="submit" class="btn-submit">등록</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'NoticeWriteView',
  data() {
    return {
      notice: {
        title: '',
        content: '',
      },
    }
  },
  methods: {
    async submitNotice() {
      try {
        const authStore = useAuthStore()
        await axios.post(
          '/api/notices',
          { title: this.notice.title, content: this.notice.content },
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          },
        )
        alert('공지사항이 등록되었습니다.')
        this.$router.push('/notices')
      } catch (err) {
        console.error('공지사항 등록 실패:', err)
        alert('등록 실패: ' + (err.response?.data?.message || err.message))
      }
    },
  },
}
</script>

<style scoped>
.notice-write-container {
  max-width: 1200px;
  margin: 48px auto 0 auto;
  padding: 40px 32px 32px 32px;
}

.page-title {
  font-size: 2.2rem;
  color: #111;
  margin-bottom: 32px;
  letter-spacing: -1px;
}

.notice-form {
  display: flex;
  border-top: 2px solid #696969;
  padding-top: 20px;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-size: 1.05rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.form-control {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border 0.18s;
  resize: none;
}
.form-control:focus {
  border-color: #8cae99;
  outline: none;
  background: #fff;
}
.textarea {
  min-height: 180px;
  font-family: inherit;
}

.btn-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.btn-submit {
  background-color: #9dbbaa;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-submit:hover {
  background-color: #aacab8;
}

@media (max-width: 600px) {
  .notice-write-container {
    padding: 18px 4px;
  }
  .page-title {
    font-size: 1.3rem;
  }
}
</style>
