<template>
  <header class="site-header">
    <div class="full-width-container">
      <div class="header-content">
        <!-- 로고 영역 -->
        <div class="logo-area">
          <router-link to="/" class="logo-link">
            <img src="@/assets/logo_icon.png" alt="사이트 로고" class="logo-img" />
          </router-link>
        </div>

        <!-- 네비게이션 영역 -->
        <nav class="main-nav">
          <ul class="nav-list">
            <!-- 모든 사용자에게 보이는 메뉴 -->
            <li class="nav-item">
              <router-link to="/attractions" class="nav-link">전체 명소 조회</router-link>
            </li>

            <!-- 로그인한 사용자에게만 보이는 메뉴 -->
            <li v-if="isLoggedIn" class="nav-item">
              <router-link to="/my-travel-plans" class="nav-link">나의 여행 계획</router-link>
            </li>

            <!-- 모든 사용자에게 보이는 메뉴 -->
            <li class="nav-item">
              <router-link to="/hotplaces" class="nav-link">핫플 자랑하기</router-link>
            </li>

            <!-- 로그인한 사용자에게만 보이는 메뉴 -->
            <li v-if="isLoggedIn" class="nav-item">
              <router-link to="/my-profile" class="nav-link">내 정보</router-link>
            </li>

            <!-- 관리자에게만 보이는 메뉴 -->
            <li v-if="isAdmin" class="nav-item">
              <router-link to="/admin/members" class="nav-link">회원 목록 조회</router-link>
            </li>

            <!-- 로그인 상태에 따라 다른 메뉴 -->
            <li v-if="!isLoggedIn" class="nav-item">
              <router-link to="/login" class="nav-link">로그인</router-link>
            </li>
            <li v-else class="nav-item">
              <button @click="logout" class="nav-link logout-btn">로그아웃</button>
            </li>
            <li v-if="!isLoggedIn" class="nav-item">
              <router-link to="/signup" class="nav-link">회원가입</router-link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'SiteHeader',
  computed: {
    isLoggedIn() {
      return this.$store?.state?.auth?.isLoggedIn || false
    },
    isAdmin() {
      return this.$store?.state?.auth?.userRole === 'ADMIN' || false
    },
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout')
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped>
/* 기본 리셋 */
body {
  margin: 0;
  padding: 0;
}

/* hover 시 배경색 제거 */
a.router-link-active:hover,
a.router-link-exact-active:hover,
a.router-link:hover,
.logo-link:hover {
  background-color: transparent !important;
}

/* 헤더 고정 */
.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;
  margin: 0;
  padding: 0;
}

/* 내부 wrapper */
.full-width-container {
  width: 100%;
  padding: 0;
  margin: 0;
}

/* 컨텐츠 가운데 정렬 */
.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 15px 20px;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 로고 */
.logo-area {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 60px;
  object-fit: contain;
}

/* 네비게이션 */
.main-nav {
  display: flex;
  align-items: center;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 10px;
}

.nav-item {
  margin: 0 5px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 500;
}

/* 활성화 링크 강조 */
.nav-link.router-link-active {
  color: #aacab8;
  font-weight: 600;
}

/* 로그아웃 버튼 */
.logout-btn {
  background-color: transparent;
  border: 1px solid #ccc;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
}

.logout-btn:hover {
  background-color: #f0f0f0;
}

/* 반응형 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
  }

  .nav-list {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
