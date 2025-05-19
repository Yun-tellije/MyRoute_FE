<template>
  <div class="notice-write-container">
    <h1 class="page-title">공지사항 등록</h1>

    <form @submit.prevent="submitNotice">
      <div class="form-group">
        <label for="title">제목</label>
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
        <label for="content">내용</label>
        <textarea
          id="content"
          v-model="notice.content"
          class="form-control"
          rows="10"
          required
          placeholder="내용을 입력하세요"
        ></textarea>
      </div>

      <button type="submit" class="btn-submit">등록</button>
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
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.btn-submit {
  background-color: #9dbbaa;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
.btn-submit:hover {
  background-color: #8cae99;
}
</style>
