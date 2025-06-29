import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: import('@/views/home/HomeView.vue'),
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('@/views/auth/SignupView.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
    },
    {
      path: '/find-password',
      name: 'FindPassword',
      component: () => import('@/views/auth/FindPasswordView.vue'),
    },
    {
      path: '/attplan',
      name: 'MyPlanPage',
      component: () => import('@/views/plan/MyPlanPage.vue'),
    },
    {
      path: '/plan/confirm',
      name: 'PlanConfirm',
      component: () => import('@/views/plan/PlanConfirm.vue'),
    },
    {
      path: '/member/me',
      name: 'MyInfo',
      component: () => import('@/views/member/MyInfoView.vue'),
    },
    {
      path: '/planboard',
      name: 'PublicPlanBoard',
      component: () => import('@/views/plan/PublicPlanBoard.vue'),
    },
    {
      path: '/plan-detail/:planId',
      name: 'PlanDetail',
      component: () => import('@/views/plan/PlanDetail.vue'),
    },
    {
      path: '/notices',
      name: 'Notices',
      component: () => import('@/views/notice/NoticeListView.vue'),
    },
    {
      path: '/notices/:noticeId',
      name: 'NoticeDetail',
      component: () => import('@/views/notice/NoticeDetailView.vue'),
    },
    {
      path: '/hotplacelist',
      name: 'HotPlaceList',
      component: () => import('@/views/hotplace/HotPlaceList.vue'),
    },
    {
      path: '/hotplacecreate',
      name: 'HotPlaceForm',
      component: () => import('@/views/hotplace/HotPlaceForm.vue'),
    },
    {
      path: '/hotplaceDetail/:id',
      name: 'HotPlaceDetail',
      component: () => import('@/views/hotplace/HotPlaceDetail.vue'),
    },
    {
      path: '/notices/write',
      name: 'NoticeWrite',
      component: () => import('@/views/notice/NoticeWriteView.vue'),
    },
    {
      path: '/notices/edit/:noticeId',
      name: 'NoticeEdit',
      component: () => import('@/views/notice/NoticeEditView.vue'),
    },
    {
      path: '/member/posts',
      name: 'MyPosts',
      component: () => import('@/views/member/MyPostsView.vue'),
    },
    {
      path: '/hotplace/edit/:id',
      name: 'HotPlaceEdit',
      component: () => import('@/views/hotplace/HotPlaceForm.vue'),
    },
    {
      path: '/member/likes',
      name: 'MyLikes',
      component: () => import('@/views/member/MyLikesView.vue'),
    },
    {
      path: '/member/bookmarks',
      name: 'MyBookMarks',
      component: () => import('@/views/member/MyBookMarksView.vue'),
    },
  ],
})

export default router
