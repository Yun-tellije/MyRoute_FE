<template>
  <div class="hotplace-list-page">
    <div class="hotplace-list-header">
      <h2 class="hotplace-list-title">핫플 게시판</h2>
      <div class="hotplace-list-filter">
        <select class="form-select" v-model="sortOption" style="width: 100px">
          <option value="latest">최신순</option>
          <option value="likes">추천순</option>
        </select>
        <button class="search-btn" @click="sortPosts">조회</button>
      </div>
    </div>

    <div v-if="filteredPosts.length === 0" class="no-data-msg">
      해당 조건에 맞는 게시글이 없습니다.
    </div>

    <div v-else>
      <div class="hotplace-card-grid">
        <div v-for="(row, rowIdx) in paginatedRows" :key="rowIdx" class="hotplace-card-row">
          <div
            v-for="post in row"
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
                  {{ post.starPoint }}
                </span>
                <span>
                  <i class="fa-solid fa-heart" style="color: #ed4856"></i>
                  {{ post.likeCount }}
                </span>
                <span>
                  <i class="fa-solid fa-user" style="color: #888"></i>
                  {{ post.memberId }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="currentPage === 1" @click="changePage(1)">
          <i class="fa-solid fa-angles-left"></i>
        </button>
        <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          <i class="fa-solid fa-angle-left"></i>
        </button>
        <button
          v-for="page in pageNumbers"
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
      </div>
    </div>

    <div class="btn-write-wrap">
      <button v-if="isLoggedIn" class="btn-write" @click="$router.push('/hotplacecreate')">
        글쓰기
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  data() {
    return {
      originalPosts: [],
      posts: [],
      currentPage: 1,
      perPage: 6,
      sortOption: 'latest',
      searchKeyword: '',
    }
  },
  computed: {
    isLoggedIn() {
    const authStore = useAuthStore()
    return authStore.isLoggedIn
  },
    filteredPosts() {
      return [...this.posts]
    },
    paginatedPosts() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredPosts.slice(start, start + this.perPage)
    },
    paginatedRows() {
      const rows = []
      const posts = this.paginatedPosts
      for (let i = 0; i < posts.length; i += 3) {
        rows.push(posts.slice(i, i + 3))
      }
      return rows
    },
    totalPages() {
      return Math.ceil(this.filteredPosts.length / this.perPage)
    },
    pageNumbers() {
      const total = this.totalPages
      const group = Math.floor((this.currentPage - 1) / 5)
      const start = group * 5 + 1
      const end = Math.min(start + 4, total)
      const arr = []
      for (let i = start; i <= end; i++) arr.push(i)
      return arr
    },
  },
  methods: {
    async fetchPosts() {
      try {
        const res = await axios.get('/api/hotplace/posts')
        this.originalPosts = res.data
        this.posts = [...this.originalPosts]
        this.sortPosts()
      } catch (err) {
        console.error('게시글 불러오기 실패', err)
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    sortPosts() {
      this.currentPage = 1

      let sorted = [...this.originalPosts]
      if (this.sortOption === 'likes') {
        sorted.sort((a, b) => {
          if (b.likeCount === a.likeCount) {
            return b.hotplaceId - a.hotplaceId
          }
          return b.likeCount - a.likeCount
        })
      } else {
        sorted.sort((a, b) => b.hotplaceId - a.hotplaceId)
      }

      const keyword = this.searchKeyword.trim().toLowerCase()
      if (keyword.length >= 2) {
        this.posts = sorted.filter(
          (post) =>
            post.title.toLowerCase().includes(keyword) ||
            post.attractionName?.toLowerCase().includes(keyword),
        )
      } else {
        this.posts = sorted
      }
    },

    goDetail(id) {
      this.$router.push(`/hotplaceDetail/${id}`)
    },
    getImageSrc(image) {
      return `data:image/jpeg;base64,${image}`
    },
  },
  async mounted() {
    await this.fetchPosts()
  },
}
</script>

<style scoped>
.hotplace-list-page {
  max-width: 1200px;
  margin: 40px auto 0 auto;
  padding: 40px 32px 0 32px;
}
.hotplace-list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}
.hotplace-list-title {
  font-size: 2.2rem;
  color: #111;
  margin: 0;
}
.hotplace-list-filter {
  display: flex;
  gap: 10px;
  align-items: center;
}
.search-btn {
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  background-color: #9dbbaa;
  color: white;
}
.serrch-btn:hover {
  background-color: #aacab8;
}
.no-data-msg {
  color: #b0b0b0;
  text-align: center;
  padding: 48px 0;
  border-radius: 6px;
  font-size: 1.2rem;
  margin-bottom: 24px;
}
.hotplace-card-grid {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-bottom: 32px;
}
.hotplace-card-row {
  display: flex;
  gap: 22px;
}
.hotplace-card {
  flex: 1 1 0;
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
  min-width: 0;
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
.btn-write-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
}
.btn-write {
  background: #9dbbaa;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 14px;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
}
.btn-write:hover {
  background: #aacab8;
}
</style>
