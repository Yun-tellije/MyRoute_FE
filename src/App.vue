<template>
  <div class="app-container">
    <AppHeader />
    <main class="page-content">
      <RouterView />
    </main>
    <AppFooter />
    <ChatBotWidget />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Noto Sans KR', sans-serif;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-content {
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  margin-bottom: 100px;
}

@font-face {
  font-family: 'GowunDodum-Regular';
  src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2108@1.1/GowunDodum-Regular.woff')
    format('woff');
  font-weight: normal;
  font-style: normal;
}
</style>
