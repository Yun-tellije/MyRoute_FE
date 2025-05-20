<template>
  <div class="my-posts-container">
    <h1 class="page-title">내가 작성한 글</h1>

    <div class="tab-bar">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'plan' }"
        @click="activeTab = 'plan'"
      >
        나의 여행 계획
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'hotplace' }"
        @click="activeTab = 'hotplace'"
      >
        핫플 게시물
      </button>
    </div>

    <component :is="activeTabComponent" :plans="myPlans" :hotplaces="myHotplaces" />
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import MyTravelPlans from '@/components/member/MyTravelPlans.vue'
import MyHotplacePosts from '@/components/member/MyHotplacePosts.vue'

export default {
  name: 'MyPostsView',
  components: {
    MyTravelPlans,
    MyHotplacePosts,
  },
  data() {
    return {
      activeTab: 'plan',
      myPlans: [],
      myHotplaces: [],
    }
  },
  computed: {
    activeTabComponent() {
      return this.activeTab === 'plan' ? 'MyTravelPlans' : 'MyHotplacePosts'
    },
  },
  async created() {
    const store = useAuthStore()
    const userId = store.userId

    try {
      const [plansRes, hotRes] = await Promise.all([
        axios.get(`/api/plans/mine?userId=${userId}`),
        axios.get(`/api/hotplaces/mine?userId=${userId}`),
      ])
      this.myPlans = plansRes.data
      this.myHotplaces = hotRes.data
    } catch (err) {
      console.error('내 작성글 조회 실패:', err)
    }
  },
}
</script>
