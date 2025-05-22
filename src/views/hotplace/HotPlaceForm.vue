<template>
  <div class="container mt-5">
    <div class="card shadow-sm p-4 mb-5">
      <h2 class="mb-4">{{ isEdit ? '✏️ 글 수정' : '📝 새 글쓰기' }}</h2>

      <div class="mb-4">
        <label class="form-label fw-bold">📍 장소 검색</label>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-primary" @click="showSearch = true">장소 선택</button>
          <span class="text-muted"
            >선택된 장소: <strong>{{ selectedPlace?.title || '없음' }}</strong></span
          >
        </div>
        <SearchPopup
          :visible="showSearch"
          :all-attractions="attractions"
          @close="showSearch = false"
          @select="onSelectPlace"
        />
      </div>

      <div class="mb-3">
        <label class="form-label fw-bold">제목</label>
        <input
          type="text"
          class="form-control"
          v-model="form.title"
          required
          placeholder="제목을 입력하세요"
        />
      </div>

      <div
        class="star-wrapper d-flex align-items-center gap-2"
        @mousemove="$_onStarHover"
        @mouseleave="hoverScore = 0"
      >
        <img
          v-for="idx in 5"
          :key="idx"
          :src="getStarImage(idx)"
          @click="onStarClick($event, idx)"
          class="star-icon"
          :ref="setStars"
          alt="별점"
        />
        <span class="text-muted ms-2">({{ selectedStarNum }}점)</span>
      </div>
      <br />

      <div class="mb-4">
        <label class="form-label fw-bold">📷 이미지 첨부 (선택)</label>
        <input
          type="file"
          class="form-control"
          multiple
          accept="image/png, image/jpeg"
          @change="onFileChange"
          ref="fileInput"
        />

        <div class="mt-3 d-flex flex-wrap gap-3">
          <div v-for="(url, i) in previews" :key="i" class="position-relative preview-box">
            <img :src="url" class="preview-img" />
            <button class="btn-close preview-remove" @click="removeFile(i)" type="button"></button>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <label class="form-label fw-bold">📝 리뷰 내용</label>
        <textarea
          class="form-control fixed-textarea"
          v-model="form.content"
          placeholder="내용을 입력하세요"
        ></textarea>
      </div>

      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-success" @click="submit">
          {{ isEdit ? '수정 저장' : '등록' }}
        </button>
        <button class="btn btn-secondary" @click="$router.back()">취소</button>
      </div>
    </div>
  </div>
</template>

<script>
import SearchPopup from '@/components/hotplace/SearchPopup.vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  components: { SearchPopup },
  data() {
    return {
      form: { title: '', rating: 0, content: '' },
      query: '',
      suggestions: [],
      selectedAttraction: null,
      files: [],
      previews: [],
      isEdit: false,
      selectedStarNum: 0,
      hoverScore: 0,
      isRegistered: false,
      starLeftOffsetXs: [],
      starElements: [],
      showSearch: false,
      selectedPlace: null,
      attractions: [],
      userProfile: {
        id: '',
        name: '',
        phone: '',
        email: '',
      },
    }
  },
  mounted() {
    const id = this.$route.params.id
    const authStore = useAuthStore()

    if (authStore.user) {
      this.userProfile = {
        id: authStore.user.id,
        name: authStore.user.name,
        phone: authStore.user.phone,
        email: authStore.user.email,
      }
    }

    if (id) {
      this.isEdit = true
      fetch(`/api/hotplace/edit/${id}`)
        .then((r) => r.json())
        .then((data) => {
          this.form = {
            title: data.title,
            content: data.content,
            rating: data.rating,
          }
          this.selectedStarNum = data.rating

          this.selectedPlace = {
            no: data.no,
            title: data.attractionName,
          }
          this.selectedAttraction = this.selectedPlace

          if (data.imageBase64) {
            this.previews = [data.imageBase64]
          }
        })
    }

    this.$nextTick(() => {
      this.$_initStarOffsets()
    })
  },
  created() {
    this.fetchUserInfo()
  },
  methods: {
    async fetchUserInfo() {
      try {
        const authStore = useAuthStore()
        const res = await axios.get('/api/members/me', {
          headers: { Authorization: `Bearer ${authStore.token}` },
        })
        this.userProfile = {
          id: res.data.id,
          name: res.data.name,
          phone: res.data.pnumber,
          email: res.data.email,
        }
      } catch (err) {
        alert('유저 정보를 불러오지 못했습니다.', err)
      }
    },
    onSearch() {
      if (!this.query) return (this.suggestions = [])
      fetch(`/api/hotplace/searchAttractions?q=${encodeURIComponent(this.query)}`)
        .then((r) => r.json())
        .then((data) => (this.suggestions = data.slice(0, 5)))
    },
    selectAttraction(item) {
      this.selectedAttraction = item
      this.query = item.title
      this.suggestions = []
    },
    onFileChange(e) {
      const file = e.target.files[0]
      if (!file) {
        this.files = []
        this.previews = []
        return
      }

      const validTypes = ['image/jpeg', 'image/png']
      if (!validTypes.includes(file.type)) {
        alert('이미지는 JPG 또는 PNG 형식만 등록 가능합니다.')
        this.files = []
        this.previews = []
        const input = this.$refs.fileInput
        if (input) input.value = ''
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        this.previews = [reader.result]
      }
      reader.readAsDataURL(file)

      this.files = [file]
    },

    removeFile(index) {
      this.files.splice(index, 1)
      this.previews.splice(index, 1)
      const input = this.$refs.fileInput
      if (input) input.value = ''
    },
    async submit() {
      const authStore = useAuthStore()
      const token = authStore.token

      if (!token) {
        alert('로그인이 필요합니다.')
        return
      }

      if (!this.form.title.trim()) {
        alert('제목을 입력해주세요.')
        return
      }

      if (!this.selectedAttraction || !this.selectedAttraction.no) {
        alert('장소를 선택해주세요.')
        return
      }

      if (!this.selectedStarNum || this.selectedStarNum <= 0) {
        alert('별점을 선택해주세요.')
        return
      }

      if (!this.form.content.trim()) {
        alert('내용을 입력해주세요.')
        return
      }

      const body = new FormData()
      body.append('no', this.selectedAttraction.no)
      body.append('title', this.form.title)
      body.append('rating', this.selectedStarNum)
      body.append('content', this.form.content)
      body.append('writerId', this.userProfile.id)
      this.files.forEach((f) => body.append('images', f))

      try {
        if (this.isEdit) {
          const postId = this.$route.params.id
          await axios.put(`/api/hotplace/edit/${postId}`, body, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          })
        } else {
          await axios.post('/api/hotplace/upload', body, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          })
        }

        alert('저장이 완료되었습니다')
        this.$router.push('/hotplacelist')
      } catch (err) {
        alert('등록 실패: ' + err.message)
      }
    },
    $_initStarOffsets() {
      this.starLeftOffsetXs = this.starElements.map((el) => el.getBoundingClientRect().left)
    },
    $_onTouchMove(e) {
      if (this.isRegistered) return
      const touchX = e.changedTouches[0].clientX
      const starNum = this.$_getTouchEndStar(touchX)
      if (starNum !== null) {
        this.selectedStarNum = starNum
      }
    },
    $_getTouchEndStar(posX) {
      for (let i = this.starLeftOffsetXs.length - 1; i >= 0; i--) {
        if (posX >= this.starLeftOffsetXs[i]) {
          return i + 1
        }
      }
      return 1
    },
    getStarImage(idx) {
      const score = this.hoverScore || this.selectedStarNum
      if (score >= idx) return '/resource/star-solid.svg'
      else if (score >= idx - 0.5) return '/resource/star-half-stroke-solid.svg'
      else return '/resource/star-regular.svg'
    },
    onStarClick(event, idx) {
      const { left, width } = event.target.getBoundingClientRect()
      const offsetX = event.clientX - left
      const clickRatio = offsetX / width
      this.selectedStarNum = clickRatio < 0.5 ? idx - 0.5 : idx
    },

    $_onStarHover(event) {
      const stars = this.starElements
      for (let i = 0; i < stars.length; i++) {
        const rect = stars[i].getBoundingClientRect()
        if (event.clientX >= rect.left && event.clientX <= rect.right) {
          const isHalf = event.clientX - rect.left < rect.width / 2
          this.hoverScore = isHalf ? i + 0.5 : i + 1
          return
        }
      }
      this.hoverScore = 0
    },
    setStars(el) {
      if (el) this.starElements.push(el)
    },
    onSelectPlace(place) {
      if (place.no) {
        this.selectedPlace = place
        this.selectedAttraction = place
        this.query = place.title
        this.showSearch = false
      }
    },
  },
}
</script>

<style scoped>
.card {
  border-radius: 12px;
}

.star-icon {
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s;
}
.preview-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.preview-box {
  position: relative;
}

.preview-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: white;
  border-radius: 50%;
  padding: 2px;
  border: 1px solid #ccc;
}
.fixed-textarea {
  height: 200px;
  resize: none;
}
</style>
