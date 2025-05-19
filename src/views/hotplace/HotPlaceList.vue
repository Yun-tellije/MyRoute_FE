<template>
  <div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>핫플 게시판</h2>

      <div class="d-flex align-items-center gap-2">
        <select class="form-select" style="width: 180px" v-model="sortOption">
          <option value="latest">최신 순</option>
          <option value="likes">추천 많은 순</option>
          <option value="mine">내가 쓴 게시물</option>
        </select>
        <button class="btn btn-outline-secondary" @click="sortPosts">조회</button>
      </div>
    </div>

    <div v-if="filteredPosts.length === 0" class="alert alert-info">
      해당 조건에 맞는 게시글이 없습니다.
    </div>

    <div v-else>
      <div
        v-for="post in paginatedPosts"
        :key="post.id"
        class="card mb-3 shadow-sm card-hover"
        @click="goDetail(post.hotplaceId)"
      >
        <div class="card-body">
          <h5 class="card-title">{{ post.title }}</h5>
          <h5 class="card-title">{{ post.attractionName }}</h5>
          <p class="card-text text-muted">
            - ★{{ post.starPoint }} , 작성자: {{ post.memberId }} , 추천 수: {{ post.likeCount }}
          </p>
        </div>
      </div>

      <nav class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)">이전</button>
          </li>
          <li
            class="page-item"
            v-for="page in totalPages"
            :key="page"
            :class="{ active: currentPage === page }"
          >
            <button class="page-link" @click="changePage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="changePage(currentPage + 1)">다음</button>
          </li>
        </ul>
      </nav>
    </div>

    <div class="text-end mt-5">
      <button v-if="isLoggedIn" class="btn btn-primary" @click="$router.push('/hotplacecreate')">
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
      posts: [],
      currentPage: 1,
      perPage: 10,
      sortOption: 'latest',
      userId: '',
      isLoggedIn: false,
    }
  },
  computed: {
    filteredPosts() {
      if (this.sortOption === 'mine') {
        return this.posts.filter((p) => p.author === this.userId)
      }
      return [...this.posts]
    },
    sortedPosts() {
      const posts = [...this.filteredPosts]
      if (this.sortOption === 'likes') {
        return posts.sort((a, b) => b.likes - a.likes)
      }
      return posts.sort((a, b) => b.id - a.id)
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
    async fetchUserInfo() {
      const authStore = useAuthStore()
      if (authStore.token) {
        try {
          const res = await axios.get('/api/members/me', {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          })
          this.userId = res.data.memberId
          this.isLoggedIn = true
        } catch (err) {
          console.warn('사용자 정보 조회 실패', err)
        }
      }
    },
    async fetchPosts() {
      try {
        const res = await axios.get('/api/hotplace/posts')
        this.posts = res.data
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
    },
    goDetail(id) {
      this.$router.push(`/hotplaceDetail/${id}`)
    },
  },
  async mounted() {
    await this.fetchUserInfo()
    await this.fetchPosts()
  },
}
</script>

<style scoped>
.card-hover:hover {
  background: #f9f9f9;
  cursor: pointer;
}
</style>
