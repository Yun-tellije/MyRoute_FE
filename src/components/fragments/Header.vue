<template>
  <header class="site-header">
    <div class="full-width-container">
      <div class="header-content">
        <!-- 로고 영역 -->
        <div class="logo-area">
          <router-link to="/" class="logo-link">
            <img src="@/assets/img/logo_icon.png" alt="사이트 로고" class="logo-img" />
          </router-link>
        </div>

        <!-- 네비게이션 영역 -->
        <nav class="main-nav">
          <ul class="nav-list">
            <li class="nav-item">
              <router-link to="/notices" class="nav-link">공지사항</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/planboard" class="nav-link">계획 게시판</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/hotplacelist" class="nav-link">핫플 자랑하기</router-link>
            </li>

            <!-- 드롭다운 사용자 메뉴 -->
            <li
              v-if="isLoggedIn"
              class="nav-item dropdown-container"
              @click="toggleDropdown"
              @blur="closeDropdown"
              tabindex="0"
            >
              <span class="nav-link user-name"
                >{{ userName }} 님&nbsp;<i class="fa-solid fa-caret-down"></i
              ></span>
              <ul v-show="showDropdown" class="dropdown-menu-list">
                <li>
                  <router-link to="/member/me" class="dropdown-item">
                    <div class="icon-box"><i class="fa fa-user"></i></div>
                    내 정보
                  </router-link>
                </li>
                <li>
                  <router-link to="/member/posts" class="dropdown-item">
                    <div class="icon-box"><i class="fa fa-list-ul"></i></div>
                    내 작성글
                  </router-link>
                </li>
                <li>
                  <button @click.stop="logout" class="dropdown-item logout">
                    <div class="icon-box"><i class="fa fa-sign-out-alt"></i></div>
                    로그아웃
                  </button>
                </li>
              </ul>
            </li>

            <!-- 비로그인 메뉴 -->
            <li v-if="!isLoggedIn" class="nav-item">
              <router-link to="/login" class="nav-link">로그인</router-link>
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
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'SiteHeader',
  data() {
    return {
      showDropdown: false,
    }
  },
  computed: {
    isLoggedIn() {
      const authStore = useAuthStore()
      return authStore.isLoggedIn
    },
    isAdmin() {
      const authStore = useAuthStore()
      return authStore.userRole === 'ADMIN'
    },
    userName() {
      const authStore = useAuthStore()
      return authStore.userName
    },
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    closeDropdown() {
      setTimeout(() => (this.showDropdown = false), 100)
    },
    logout() {
      const authStore = useAuthStore()
      authStore.logout()
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped>
a.router-link-active:hover,
a.router-link-exact-active:hover,
a.router-link:hover,
.logo-link:hover {
  background-color: transparent !important;
}

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

.full-width-container {
  width: 100%;
  padding: 0;
  margin: 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-area {
  display: flex;
  padding: 5px;
  align-items: center;
}

.logo-img {
  height: 60px;
  object-fit: contain;
}

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
  border-radius: 6px;
  font-weight: 500;
}

.nav-link.router-link-active {
  color: #aacab8;
  font-weight: 600;
}

.dropdown-container {
  position: relative;
  cursor: pointer;
}

.user-name {
  padding: 8px 12px;
  border-radius: 6px;
  color: #333;
  font-weight: 500;
}

.dropdown-menu-list {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  list-style: none;
  text-align: left;
  padding: 4px 8px;
  margin: 6px 0 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 160px;
  z-index: 2000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 16px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  gap: 22px;
}

.icon-box {
  width: 14px;
}

.dropdown-item:hover {
  color: #aacab8;
  font-weight: bold;
}

.dropdown-item.logout {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

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
