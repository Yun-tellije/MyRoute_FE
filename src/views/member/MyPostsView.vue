<template>
  <div class="my-posts-container">
    <h1 class="page-title">내 작성글</h1>

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
        나의 핫플
      </button>
    </div>

    <component :is="activeTabComponent" :plans="myPlans" :hotplaces="myHotplaces" />
  </div>
</template>

<script>
import MyTravelPlans from '@/components/member/MyTravelPlans.vue'
import MyHotplacePosts from '@/components/member/MyHotPlacePosts.vue'

export default {
  name: 'MyPostsView',
  components: {
    MyTravelPlans,
    MyHotplacePosts,
  },
  data() {
    return {
      activeTab: 'plan',
    }
  },
  computed: {
    activeTabComponent() {
      return this.activeTab === 'plan' ? 'MyTravelPlans' : 'MyHotplacePosts'
    },
  },
}
</script>

<style scoped>
.my-posts-container {
  max-width: 1000px;
  margin: 0 auto 0 auto;
  padding: 40px 32px 26px 32px;
}

.page-title {
  margin-bottom: 30px;
  font-size: 2rem;
  font-weight: 500;
  color: #333;
}

.tab-bar {
  display: flex;
  border-bottom: 2px solid #ededed;
  background: #ededed;
  overflow: hidden;
  margin-bottom: 40px;
}

.tab-button {
  flex: 1 1 0;
  background: #ededed;
  border: none;
  outline: none;
  color: #b0b0b0;
  font-size: 1.08rem;
  font-weight: 500;
  padding: 0;
  margin: 0;
  height: 44px;
  cursor: pointer;
  border-right: 1px solid #e0e0e0;
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  transition:
    color 0.18s,
    border 0.18s,
    background 0.18s;
  letter-spacing: 0.5px;
}

.tab-button:last-child {
  border-right: none;
}

.tab-button.active {
  background: #fff;
  color: #9dbbaa;
  border-top: 2px solid #9dbbaa;
  border-bottom: 1px solid #fff;
  z-index: 1;
}

.tab-button:not(.active):hover {
  color: #9dbbaa;
  background: #f7f7f7;
}

@media (max-width: 600px) {
  .my-posts-container {
    padding: 10px 2px;
  }
  .page-title {
    font-size: 1.2rem;
  }
  .tab-bar {
    height: 38px;
  }
  .tab-button {
    font-size: 0.98rem;
    height: 38px;
    line-height: 38px;
  }
}
</style>
