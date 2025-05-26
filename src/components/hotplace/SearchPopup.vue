<template>
  <div class="popup-overlay" v-if="visible">
    <div class="popup-card">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="mb-0">장소 검색</h5>
        <button class="btn-close" @click="$emit('close')"></button>
      </div>

      <form @submit.prevent="onSearch">
        <input v-model="search" class="form-control mb-2" placeholder="장소 이름 입력 (2자 이상)" />
        <button class="btn btn-primary w-100" :disabled="search.length < 2">조회</button>
      </form>

      <ul v-if="isSearched && results.length" class="list-group mt-3">
        <li
          v-for="place in results"
          :key="place.attractionNo"
          class="list-group-item list-group-item-action"
          @click="$emit('select', place)"
        >
          {{ place.title }}
        </li>
      </ul>

      <p v-else-if="isSearched && search.length >= 2" class="text-muted text-center mt-3">
        결과가 없습니다.
      </p>
    </div>
  </div>
</template>

<script>
import { Trie } from '@/utils/Trie'

export default {
  props: ['visible', 'allAttractions'],
  data() {
    return {
      search: '',
      results: [],
      isSearched: false,
      trie: new Trie(),
    }
  },
  mounted() {
    fetch('/api/hotplace/allAttractions')
      .then((r) => r.json())
      .then((data) => {
        this.attractions = data
        data.forEach((a) => this.trie.insert(a.title))
      })

    const id = this.$route.params.id
    if (id) {
      this.isEdit = true
      fetch(`/api/hotplace/posts/${id}`)
        .then((r) => r.json())
        .then((data) => {
          this.form = { title: data.title, rating: data.rating, content: data.content }
          this.selectedAttraction = { attractionNo: data.attractionNo, title: data.attractionName }
          this.selectedStarNum = data.rating
        })
    }

    this.$nextTick(() => {
      this.$_initStarOffsets()
    })
  },
  methods: {
    onSearch() {
      this.isSearched = true
      if (this.search.length < 2) {
        this.results = []
        return
      }
      this.results = this.attractions.filter((a) =>
        a.title.toLowerCase().includes(this.search.toLowerCase()),
      )
    },
  },
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.popup-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
