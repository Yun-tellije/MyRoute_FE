<template>
  <div>
    <!-- 좌우 여백 없이 꽉 차는 헤더 -->
    <AppHeader />

    <!-- 가운데 정렬되는 본문 영역 -->
    <main class="page-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
// import AppHeader from '@/components/AppHeader.vue'
</script>

<style>
/* 페이지 본문만 max-width 적용 */
.page-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}

/* 전역 기본 스타일 정리 */
body {
  margin: 0;
  padding: 0;
  font-family: 'Noto Sans KR', sans-serif;
}
</style>
