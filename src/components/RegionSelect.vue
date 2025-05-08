<template>
  <form @submit.prevent="$emit('search')" class="d-flex gap-2 mb-4">
    <select
      v-model="localSido"
      @change="onSidoChange"
      class="form-select"
      style="flex: 1; max-width: 300px"
    >
      <option disabled value="">시도 선택</option>
      <option v-for="(list, key) in areaData" :key="key" :value="key">{{ key }}</option>
    </select>
    <select
      v-model="localGugun"
      :disabled="!localSido"
      class="form-select"
      style="flex: 1; max-width: 300px"
    >
      <option disabled value="">시군구 선택</option>
      <option v-for="g in areaData[localSido]" :key="g" :value="g">{{ g }}</option>
    </select>
    <button class="btn btn-primary">조회 하기</button>
  </form>
</template>

<script>
export default {
  name: 'RegionSelect',
  props: ['initialSido', 'initialGugun', 'areaData'],
  data() {
    return { localSido: this.initialSido, localGugun: this.initialGugun }
  },
  methods: {
    onSidoChange() {
      this.localGugun = ''
      this.$emit('update-gugun', this.localGugun)
      this.$emit('update-sido', this.localSido)
    },
  },
}
</script>
