<template>
  <form @submit.prevent="submitComment" class="d-flex gap-2 mb-3">
    <input
      v-model="content"
      type="text"
      class="form-control"
      placeholder="댓글을 입력하세요"
      required
    />
    <button class="btn btn-primary">작성</button>
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
