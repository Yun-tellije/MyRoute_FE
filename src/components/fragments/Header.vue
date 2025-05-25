<template>
  <header class="site-header">
    <div class="full-width-container">
      <div class="header-content">
        <div class="logo-area">
          <router-link to="/" class="logo-link">
            <img src="@/assets/img/logo_icon.png" alt="사이트 로고" class="logo-img" />
          </router-link>
        </div>

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

           <li v-if="isLoggedIn" class="nav-item">
  <div class="user-area">
    <!-- 알림 아이콘 -->
    <div class="notification-wrapper" ref="notification">
      <div class="notification-icon" @click.stop="toggleNotificationDropdown">
        <i class="fa fa-bell"></i>
        <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
      </div>

      <ul v-show="showNotifications" class="notification-menu-list">
        <li
  v-for="n in notifications"
  :key="n.notificationId"
  class="notification-item"
  :class="{ unread: !n.read }"
>
  <router-link :to="n.url" @click="markAsRead(n.notificationId)">
    <div class="noti-text">{{ n.content }}</div>
    <div class="noti-time">{{ formatRelativeTime(n.createdAt) }}</div>
  </router-link>
</li>
        <li v-if="notifications.length === 0" class="notification-item text-muted">
          알림이 없습니다
        </li>
      </ul>
    </div>

    <!-- 프로필 드롭다운 -->
    <div class="dropdown-container" ref="dropdown" @click.stop="toggleDropdown">
      <div class="user-profile">
        <img :src="profileImage" alt="프로필 이미지" class="profile-image" />
        <span class="nav-link user-name">
          {{ userName }} 님&nbsp;<i class="fa-solid fa-caret-down"></i>
        </span>
      </div>

      <ul v-show="showDropdown" class="dropdown-menu-list">
        <li>
          <router-link to="/member/me" class="dropdown-item" @click="closeDropdown">
            <div class="icon-box"><i class="fa fa-user"></i></div>
            내 정보
          </router-link>
        </li>
        <li>
          <router-link to="/member/posts" class="dropdown-item" @click="closeDropdown">
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
    </div>
  </div>
</li>

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
      showNotifications: false,
      notifications: [],
      unreadCount: 0,
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
    profileImage() {
      const authStore = useAuthStore()
      return authStore.profileImage
    },
  },
  mounted() {
  document.addEventListener('click', this.handleClickOutside)
  this.showDropdown = false
  this.showNotifications = false
  if (this.isLoggedIn) this.fetchNotifications()
},
watch: {
  isLoggedIn(newVal) {
    if (newVal) {
      this.showDropdown = false
      this.showNotifications = false
      this.fetchNotifications()
    }
  }
},

beforeUnmount() {
  document.removeEventListener('click', this.handleClickOutside)
},
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
      this.showNotifications = false
    },
    toggleNotificationDropdown() {
    this.showNotifications = !this.showNotifications
    this.showDropdown = false
  },
    closeDropdown() {
      setTimeout(() => {
        this.showDropdown = false
        this.showNotifications = false
    }, 100)
    },
     handleClickOutside(event) {
    const profile = this.$refs.dropdown
    const bell = this.$refs.notification
    if (!profile.contains(event.target)) {
      this.showDropdown = false
    }
    if (!bell.contains(event.target)) {
      this.showNotifications = false
    }
  },
    logout() {
      const authStore = useAuthStore()
      authStore.logout()
      this.$router.push('/login')
    },
    async fetchNotifications() {
      const authStore = useAuthStore()
      try {
        const res = await fetch('/api/members/notification', {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })
        this.notifications = await res.json()
        this.unreadCount = this.notifications.filter(n => !n.read).length
      } catch (err) {
        console.error('알림 가져오기 실패:', err)
      }
    },
    async markAsRead(notificationId) {
  const authStore = useAuthStore()
  try {
    await fetch(`/api/members/notification/read/${notificationId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    this.showNotifications = false
    this.fetchNotifications()
  } catch (err) {
    console.error('알림 읽음 처리 실패:', err)
  }
}
,
    formatRelativeTime(isoDateStr) {
  const date = new Date(isoDateStr)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHr < 24) return `${diffHr}시간 전`
  return `${diffDay}일 전`
}

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
  height: 40px;
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
}

.dropdown-container {
  position: relative;
  cursor: pointer;
}

.user-profile {
  display: flex;
  align-items: center;
}

.user-name {
  padding: 8px 12px;
  border-radius: 6px;
  color: #333;
  font-weight: 500;
}

.profile-image {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid #ccc;
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

.notification-wrapper {
  position: relative;
  margin-right: 12px;
}

.notification-menu-list {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  list-style: none;
  width: 280px; /* 📏 더 넓게 */
  max-height: 350px; /* 더 많은 알림 표시 */
  overflow-y: auto;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  padding: 6px 10px;
}

.notification-item {
  font-size: 14px;
  padding: 10px 8px;
  border-radius: 6px;
  cursor: pointer; /* ✅ 포인터 표시 */
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: background-color 0.2s;
}

.notification-item.unread {
  background-color: #f5faff; /* ✅ 안읽은 알림 배경 */
  font-weight: bold;
}

.notification-item.read {
  background-color: white;
  font-weight: normal;
}

.notification-item:hover {
  background-color: #eef3f6;
}

.noti-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
}

.noti-time {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.notification-item a {
  color: #333;
  text-decoration: none;
  display: inline-block;
  max-width: 100%;
}

.notification-item:hover {
  background-color: #f1f1f1;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

</style>
