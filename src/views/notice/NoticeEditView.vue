<template>
  <div class="notice-edit-container" v-if="notice">
    <h1 class="page-title">공지사항 수정</h1>
    <form @submit.prevent="submitEdit" class="notice-form">
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
        <button type="submit" class="btn-submit">수정 완료</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'NoticeEditView',
  data() {
    return {
      notice: null,
    }
  },
  async created() {
    const noticeId = this.$route.params.noticeId
    try {
      const res = await axios.get(`/api/notices/${noticeId}`, {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
      })
      this.notice = res.data
    } catch (err) {
      console.error('공지사항 불러오기 실패:', err)
      alert('공지사항 정보를 불러오지 못했습니다.')
    }
  },
  methods: {
    async submitEdit() {
      try {
        await axios.put(
          '/api/notices',
          {
            id: this.notice.noticeId,
            title: this.notice.title,
            content: this.notice.content,
          },
          {
            headers: {
              Authorization: `Bearer ${useAuthStore().token}`,
            },
          },
        )
        alert('공지사항이 수정되었습니다.')
        this.$router.push(`/notices/${this.notice.noticeId}`)
      } catch (err) {
        console.error('공지사항 수정 실패:', err)
        useAuthStore().logout()
        alert('수정에 실패했습니다.')
      }
    },
  },
}
</script>

<style scoped>
.notice-edit-container {
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
  background-color: #fcfcfc;
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
  .notice-edit-container {
    padding: 18px 4px;
  }
  .page-title {
    font-size: 1.3rem;
  }
}
</style>
