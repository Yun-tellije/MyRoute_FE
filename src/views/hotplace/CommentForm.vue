<template>
  <form @submit.prevent="submitComment" class="comment-form-wrap">
    <input
      v-model="content"
      type="text"
      class="comment-input"
      placeholder="댓글을 입력하세요"
      required
    />
    <button class="btn-write">작성</button>
  </form>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  props: ['postId'],
  data() {
    return {
      content: '',
    }
  },
  methods: {
    async submitComment() {
      const authStore = useAuthStore()
      const token = authStore.token

      if (!token) {
        alert('로그인이 필요한 기능입니다.')
        authStore.logout()
        this.$router.push('/login')
        return
      }

      try {
        const res = await fetch(`/api/hotplace/posts/${this.postId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: this.content,
          }),
        })

        if (!res.ok) throw new Error('댓글 작성 실패')

        this.content = ''
        this.$emit('new-comment')
      } catch (err) {
        alert('댓글 작성 중 오류가 발생했습니다.', err)
      }
    },
  },
}
</script>

<style scoped>
.comment-form-wrap {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  align-items: center;
}
.comment-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1.5px solid #d0d0d0;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border 0.18s;
}
.comment-input:focus {
  border-color: #4a98e4;
}
.btn-write {
  border: none;
  padding: 8px 14px;
  border-radius: 4px;
  background-color: #9dbbaa;
  color: white;
}
.btn-write:hover {
  background-color: #aacab8;
}
</style>
