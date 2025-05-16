<template>
  <div class="mb-4">
    <h5>댓글 쓰기</h5>
    <textarea v-model="content" class="form-control mb-2" rows="2" />
    <button class="btn btn-primary" @click="submit">등록</button>
  </div>
</template>

<script>
export default {
  props: ['postId'],
  data() {
    return { content: '' }
  },
  methods: {
    submit() {
      if (!this.content.trim()) return
      fetch(`/api/hotplace/posts/${this.postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ content: this.content }),
      })
        .then((r) => {
          if (!r.ok) throw new Error()
          this.content = ''
          this.$emit('new-comment')
        })
        .catch(() => alert('댓글 등록 실패'))
    },
  },
}
</script>
