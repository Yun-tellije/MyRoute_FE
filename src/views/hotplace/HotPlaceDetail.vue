<template>
  <div class="container mt-5">
    <button class="btn btn-link mb-3" @click="$router.back()">◀ 뒤로</button>
    <div class="card mb-4">
      <div class="card-body">
        <h4>{{ post.title }}</h4>
        <p class="text-muted">
          {{ post.attractionName }} • ★{{ post.starPoint }} • 작성자: {{ post.memberId }}
        </p>
        <div v-if="post.imageBase64" class="mb-3 d-flex gap-2">
          <img :src="post.imageBase64" style="width: 150px; height: 150px; object-fit: cover" />
        </div>
        <p>{{ post.content }}</p>
      </div>
    </div>

    <comment-form :postId="post.id" @new-comment="loadComments" />
    <div v-if="comments.length === 0" class="text-center text-muted">댓글이 없습니다.</div>
    <ul class="list-group">
      <li v-for="c in comments" :key="c.commentId" class="list-group-item">
        <strong>{{ c.author }}</strong> • {{ c.content }}
      </li>
    </ul>
  </div>
</template>

<script>
import CommentForm from './CommentForm.vue'

export default {
  components: { CommentForm },
  data() {
    return { post: {}, comments: [] }
  },
  mounted() {
    const id = this.$route.params.id
    fetch(`/api/hotplace/detail/${id}`)
      .then((r) => r.json())
      .then((data) => (this.post = data))
    this.loadComments()
  },
  methods: {
    loadComments() {
      const id = this.$route.params.id
      fetch(`/api/hotplace/posts/${id}/comments`)
        .then((r) => r.json())
        .then((data) => (this.comments = data))
    },
  },
}
</script>
