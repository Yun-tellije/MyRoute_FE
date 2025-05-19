<template>
  <div class="notice-edit-container" v-if="notice">
    <h1 class="page-title">공지사항 수정</h1>

    <form @submit.prevent="submitEdit">
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

      <button type="submit" class="btn-submit">수정 완료</button>
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
    console.log('공지사항 수정 페이지:', noticeId)
    try {
      const res = await axios.get(`/api/notices/${noticeId}`, {
        headers: {
          Authorization: `Bearer ${useAuthStore.token}`,
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
        alert('수정에 실패했습니다.')
      }
    },
  },
}
</script>

<style scoped>
.notice-edit-container {
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
