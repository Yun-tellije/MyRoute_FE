<template>
  <div class="find-password-view">
    <FindPasswordForm />
  </div>
</template>

<script>
import FindPasswordForm from '@/components/auth/FindPasswordForm.vue'

export default {
  name: 'FindPasswordView',
  components: {
    FindPasswordForm,
  },
}
</script>
