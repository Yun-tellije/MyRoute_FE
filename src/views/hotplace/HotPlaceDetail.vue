<template>
  <div class="hotplace-detail-container">
    <div class="hotplace-buttons">
      <button class="btn-back" @click="$router.push('/hotplacelist')">
        <i class="fa-solid fa-caret-left"></i>&nbsp;목록으로 돌아가기
      </button>
      <div v-if="myPost" class="hotplace-owner-btns">
        <button @click="onEdit" class="btn-edit">수정</button>
        <button @click="onDelete" class="btn-delete">삭제</button>
      </div>
    </div>
    <div class="hotplace-header-box">
      <div class="hotplace-meta-row">
        <span class="hotplace-title">{{ post.title }}</span>
        <span v-if="post.updatedAt !== post.createdAt" class="hotplace-updated">(수정됨)</span>
        <span class="hotplace-date right-align">{{ formatDate(post.createdAt) }}</span>
      </div>
      <div class="hotplace-info-row">
        <span class="hotplace-writer">{{ post.memberId }}</span>
        <span class="hotplace-attraction">관광지: {{ post.attractionName }}</span>
        <span class="hotplace-star"
          ><i class="fa-solid fa-star" style="color: #ffc107"></i> {{ post.starPoint }}</span
        >
      </div>
    </div>
    <hr class="hotplace-divider" />

    <div v-if="post.imageBase64" class="hotplace-img-wrap">
      <img :src="post.imageBase64" alt="핫플레이스 이미지" class="hotplace-img" />
    </div>
    <div class="hotplace-content">{{ post.content }}</div>

    <button @click="toggleLike" class="btn-like" :class="{ liked: likedByUser }">
      <i :class="['fa-heart', likeByUser ? 'fa-solid' : 'fa-regular']"></i>
      &nbsp;{{ post.likeCount }}
    </button>
    <hr class="hotplace-divider" />

    <div class="hotplace-comment-section">
      <h5 class="comment-title"><i class="fa-regular fa-comment"></i> 댓글</h5>
      <comment-form :postId="post.hotplaceId" @new-comment="loadComments" />
      <div v-if="comments.length === 0" class="no-comment-msg">아직 댓글이 없습니다.</div>
      <ul class="comment-list">
        <li v-for="c in comments" :key="c.commentId" class="comment-item">
          <div class="comment-main">
            <div class="comment-member">
              <strong>{{ c.memberId }}</strong>
            </div>
            <div class="comment-content">{{ c.content }}</div>
          </div>
          <button v-if="c.editable" @click="deleteComment(c.commentId)" class="btn-delete-comment">
            삭제
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import CommentForm from './CommentForm.vue'
import { useAuthStore } from '@/stores/auth'

export default {
  components: { CommentForm },
  data() {
    return { post: {}, comments: [], likedByUser: true, myPost: false }
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
        this.myPost = data.myPost || false
      })

    this.loadComments()
  },
  methods: {
    loadComments() {
      const id = this.$route.params.id
      const authStore = useAuthStore()
      const token = authStore.token

      fetch(`/api/hotplace/posts/${id}/comments`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
        .then((r) => {
          if (!r.ok) {
            if (r.status === 401) throw new Error('로그인이 필요합니다.')
            throw new Error('댓글 불러오기 실패')
          }
          return r.json()
        })
        .then((data) => {
          this.comments = data
        })
        .catch((err) => {
          console.error(err.message)
          alert(err.message)
        })
    },

    toggleLike() {
      const authStore = useAuthStore()
      const token = authStore.token

      if (!token) {
        alert('로그인이 필요한 서비스입니다.')
        authStore.logout()
        this.$router.push('/login')
        return
      }

      const url = this.likedByUser
        ? `/api/hotplace/hotplacelike/cancel/${this.post.hotplaceId}`
        : `/api/hotplace/hotplacelike/${this.post.hotplaceId}`

      fetch(url, {
        method: 'POST',
        headers: {
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
          authStore.logout()
          this.$router.push('/login')
        })
    },
    async deleteComment(commentId) {
      const authStore = useAuthStore()
      const token = authStore.token

      if (!token) {
        alert('로그인이 필요한 서비스입니다.')
        authStore.logout()
        this.$router.push('/login')
        return
      }

      const ok = confirm('댓글을 삭제하시겠습니까?')
      if (!ok) return

      try {
        const res = await fetch(`/api/hotplace/commentdelete/${commentId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error('삭제 실패')

        this.loadComments()
      } catch (err) {
        alert('댓글 삭제 중 오류가 발생했습니다.', err)
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    },
    onEdit() {
      this.$router.push(`/hotplace/edit/${this.post.hotplaceId}`)
    },
    onDelete() {
      if (!confirm('삭제하시겠습니까?')) return
      const authStore = useAuthStore()

      fetch(`/api/hotplace/delete/${this.post.hotplaceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('삭제 실패')
          alert('게시글이 삭제되었습니다.')
          this.$router.push('/hotplacelist')
        })
        .catch(() => {
          alert('게시글 삭제 중 오류가 발생했습니다.')
        })
    },
  },
}
</script>

<style scoped>
.hotplace-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}
.hotplace-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 0;
  position: relative;
}
.btn-back {
  display: flex;
  align-items: center;
  background: none;
  color: #666;
  border: none;
  border-radius: 4px;
  padding: 7px 0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
  margin-right: auto;
}
.btn-back:hover {
  color: #3576b9;
}
.hotplace-owner-btns {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
.btn-edit,
.btn-delete {
  background: none;
  border: none;
  color: #888;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
}
.btn-edit:hover {
  color: #3576b9;
}
.btn-delete:hover {
  background-color: white;
  color: #ed4856;
}
.hotplace-header-box {
  border-top: 2px solid #696969;
  padding-top: 14px;
}
.hotplace-meta-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 8px;
  position: relative;
}
.hotplace-title {
  font-size: 1.6rem;
  color: #222;
  letter-spacing: -1px;
}
.hotplace-date {
  font-size: 1rem;
  margin-left: auto;
  color: #999;
}
.right-align {
  margin-left: auto;
}
.hotplace-info-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
  color: #888;
  font-size: 1rem;
  margin-bottom: 2px;
}
.hotplace-writer {
  font-size: 1rem;
  padding-right: 18px;
  border-right: 1.5px solid #d0d0d0;
}
.hotplace-attraction,
.hotplace-star,
.hotplace-updated {
  font-size: 1rem;
}
.hotplace-updated {
  color: #999999;
  font-weight: 500;
}
.hotplace-divider {
  border: none;
  border-top: 1px solid #d0d0d0;
  margin: 18px 0 28px 0;
}
.hotplace-img-wrap {
  margin-bottom: 24px;
}
.hotplace-content {
  font-size: 1.13rem;
  color: #333;
  margin-bottom: 36px;
  line-height: 1.7;
  word-break: break-all;
}
.btn-like {
  margin-left: 50%;
  align-self: flex-end;
  background: #fff;
  color: #ed4856;
  border: 1.5px solid #ed4856;
  border-radius: 50%;
  padding: 14px 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
  display: flex;
  align-items: center;
}
.btn-like.liked,
.btn-like:hover {
  background: #ed4856;
  color: #fff;
}
.hotplace-comment-section {
  margin-top: 48px;
}
.comment-title {
  margin-left: 4px;
  font-size: 1.08rem;
  font-weight: 600;
  margin-bottom: 18px;
  color: #333;
}
.no-comment-msg {
  color: #b0b0b0;
  text-align: center;
  padding: 24px 0;
  border-radius: 6px;
  font-size: 1.1rem;
  margin-bottom: 18px;
}
.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.comment-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 1.02rem;
}
.comment-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.comment-member {
  font-weight: 600;
  margin-bottom: 6px;
}
.comment-content {
  color: #333;
  word-break: break-all;
  font-size: 1rem;
}
.btn-delete-comment {
  background: none;
  border: none;
  color: #666;
  font-size: 0.98rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  padding: 4px 10px;
  transition:
    background 0.18s,
    color 0.18s;
  margin-left: 16px;
  margin-top: 2px;
  height: 32px;
}
.btn-delete-comment:hover {
  color: #ed4856;
}
@media (max-width: 700px) {
  .hotplace-detail-container {
    padding: 18px 4px;
  }
  .hotplace-title {
    font-size: 1.05rem;
  }
  .hotplace-img {
    height: 180px;
  }
}
</style>
