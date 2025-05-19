<template>
  <div class="container mt-5">
    <button class="btn btn-link mb-3" @click="$router.back()">◀ 뒤로가기</button>

    <div class="card shadow-sm border-0 mb-5">
      <div class="card-body">
        <h2 class="mb-3">{{ post.title }}</h2>
        <p class="text-muted mb-1"><strong>작성자:</strong> {{ post.memberId }}</p>
        <p class="text-muted mb-1"><strong>관광지:</strong> {{ post.attractionName }}</p>
        <p class="text-warning mb-3">⭐ {{ post.starPoint }}</p>

        <div v-if="post.imageBase64" class="mb-4 text-center">
          <img
            :src="post.imageBase64"
            alt="핫플레이스 이미지"
            class="rounded"
            style="max-width: 100%; height: 320px; object-fit: cover"
          />
        </div>

        <p class="fs-5">{{ post.content }}</p>

        <div class="text-center mt-4">
          <button
            @click="toggleLike"
            class="btn px-4 py-2"
            :class="{ 'btn-danger': likedByUser, 'btn-outline-danger': !likedByUser }"
          >
            ❤️ 추천 ({{ post.likeCount }})
          </button>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body">
        <h5 class="mb-3">💬 댓글</h5>
        <comment-form :postId="post.id" @new-comment="loadComments" />

        <div v-if="comments.length === 0" class="text-muted text-center py-3">
          아직 댓글이 없습니다.
        </div>
        <ul class="list-group list-group-flush">
          <li v-for="c in comments" :key="c.commentId" class="list-group-item">
            <strong>{{ c.author }}</strong> • {{ c.content }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import CommentForm from './CommentForm.vue'
import { useAuthStore } from '@/stores/auth'

export default {
  components: { CommentForm },
  data() {
    return { post: {}, comments: [], likedByUser: true }
  },
  mounted() {
    const id = this.$route.params.id
    const authStore = useAuthStore()
    const token = authStore.token

    fetch(`/api/hotplace/detail/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        this.post = {
          ...data.hotplace,
          imageBase64: data.imageBase64,
        }
        this.likedByUser = data.likedByUser || false
      })

    this.loadComments()
  },
  methods: {
    loadComments() {
      const id = this.$route.params.id
      fetch(`/api/hotplace/posts/${id}/comments`)
        .then((r) => r.json())
        .then((data) => (this.comments = data))
    },
    toggleLike() {
      const authStore = useAuthStore()
      const token = authStore.token

      if (!token) {
        alert('로그인이 필요한 서비스입니다.')
        this.$router.push('/login')
        return
      }

      const url = this.likedByUser
        ? `/api/hotplace/hotplacelike/cancel/${this.post.hotplaceId}`
        : `/api/hotplace/hotplacelike/${this.post.hotplaceId}`

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('처리 실패')
          this.likedByUser = !this.likedByUser
          this.post.likeCount += this.likedByUser ? 1 : -1
        })
        .catch(() => {
          alert('처리 중 오류가 발생했습니다.')
        })
    },
  },
}
</script>
