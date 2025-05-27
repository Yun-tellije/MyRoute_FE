<template>
  <div class="myhotplace-list">
    <div v-if="filteredPosts.length === 0" class="no-data-msg">저장된 핫플 게시물이 없습니다.</div>
    <div v-else>
      <div class="hotplace-card-grid">
        <div
          v-for="post in paginatedPosts"
          :key="post.hotplaceId"
          class="hotplace-card"
          @click="goDetail(post.hotplaceId)"
        >
          <div class="hotplace-card-thumb">
            <img
              v-if="post.image"
              :src="getImageSrc(post.image)"
              alt="썸네일"
              class="hotplace-thumb-img"
            />
            <div v-else class="hotplace-thumb-placeholder">No Image</div>
          </div>
          <div class="hotplace-card-body">
            <div class="hotplace-card-title">{{ post.title }}</div>
            <div class="hotplace-card-attraction">{{ post.attractionName }}</div>
            <div class="hotplace-card-info">
              <span>
                <i class="fa-solid fa-star" style="color: #ffc107"></i>
                <b>&nbsp;{{ post.starPoint }}</b>
              </span>

              <span
                ><i class="fa-solid fa-heart" style="color: #ed4856"></i>&nbsp;{{
                  post.likeCount
                }}</span
              >
            </div>
          </div>
        </div>
      </div>
      <nav class="pagination">
        <button class="page-btn" :disabled="currentPage === 1" @click="changePage(1)">
          <i class="fa-solid fa-angles-left"></i>
        </button>
        <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          <i class="fa-solid fa-angle-left"></i>
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          class="page-btn page-btn-num"
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          <i class="fa-solid fa-angle-right"></i>
        </button>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="changePage(totalPages)"
        >
          <i class="fa-solid fa-angles-right"></i>
        </button>
      </nav>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  data() {
    return {
      posts: [],
      currentPage: 1,
      perPage: 6,
      sortOption: 'latest',
      isLoggedIn: false,
    }
  },
  computed: {
    filteredPosts() {
      return [...this.posts]
    },
    sortedPosts() {
      const posts = [...this.filteredPosts]
      if (this.sortOption === 'likes') {
        return posts.sort((a, b) => b.likes - a.likes)
      }
      return posts.sort((a, b) => b.hotplaceId - a.hotplaceId)
    },
    paginatedPosts() {
      const start = (this.currentPage - 1) * this.perPage
      return this.sortedPosts.slice(start, start + this.perPage)
    },
    totalPages() {
      return Math.ceil(this.filteredPosts.length / this.perPage)
    },
  },
  methods: {
    async fetchMyHotplacePosts() {
      const authStore = useAuthStore()
      try {
        const res = await axios.get('/api/hotplace/myPosts', {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })
        this.posts = res.data
      } catch (err) {
        authStore.logout()
        console.error('내 핫플 게시글 조회 실패', err)
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    sortPosts() {
      this.currentPage = 1
    },
    goDetail(id) {
      this.$router.push(`/hotplaceDetail/${id}`)
    },
    getImageSrc(image) {
      return `data:image/jpeg;base64,${image}`
    },
  },
  async mounted() {
    await this.fetchMyHotplacePosts()
  },
}
</script>

<style scoped>
.myhotplace-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.no-data-msg {
  text-align: center;
  color: #aaa;
  padding: 32px 0;
}

.hotplace-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 28px 22px;
  margin-bottom: 32px;
}

.hotplace-card {
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(157, 187, 170, 0.06);
  cursor: pointer;
  transition:
    box-shadow 0.18s,
    border 0.18s,
    background 0.18s;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  min-height: 300px;
}
.hotplace-card:hover {
  background: #f9fafb;
  border-color: #aaaaaa;
  box-shadow: 0 4px 18px rgba(157, 187, 170, 0.13);
}

.hotplace-card-thumb {
  width: 100%;
  height: 160px;
  background: #f2f2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.hotplace-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hotplace-thumb-placeholder {
  width: 100%;
  height: 100%;
  color: #bbb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  background: #f2f2f2;
}

.hotplace-card-body {
  width: 100%;
  padding: 18px 18px 0 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.hotplace-card-title {
  font-size: 1.2rem;
  color: #222;
  font-weight: 500;
  letter-spacing: -0.5px;
  word-break: break-all;
}

.hotplace-card-attraction {
  font-size: 0.98rem;
  color: #4a98e4;
  font-weight: 500;
  margin-bottom: 2px;
}

.hotplace-card-info {
  display: flex;
  gap: 12px;
  color: #666;
  font-size: 1.02rem;
  align-items: center;
}
.hotplace-card-info b {
  color: #333;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin: 32px 0 0 0;
}
.page-btn {
  background: #fff;
  border: none;
  color: #444444;
  padding: 6px 14px;
  border-radius: 50%;
  margin: 0 1px;
  cursor: pointer;
  font-size: 1rem;
}
.page-btn.active {
  background: #222;
  color: #fff;
  border-color: #222;
}
.page-btn:disabled {
  color: #aaa;
  cursor: not-allowed;
}
.page-btn-num:not(.active):hover {
  background: #f0f0f0;
}
</style>
