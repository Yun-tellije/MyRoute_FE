<template>
  <div class="hotplace-form-container">
    <div class="hotplace-form-card">
      <h2 class="hotplace-form-title">
        {{ isEdit ? '글 수정' : '새 글쓰기' }}
      </h2>

      <form @submit.prevent="submit" class="hotplace-form">
        <div class="form-group">
          <label class="form-label">장소 검색</label>
          <div class="search-row">
            <button type="button" class="btn-search-place" @click="showSearch = true">
              장소 선택
            </button>
            <span class="selected-place"
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

        <div class="form-group">
          <label class="form-label">제목</label>
          <input
            type="text"
            class="form-control"
            v-model="form.title"
            required
            placeholder="제목을 입력하세요"
          />
        </div>

        <div class="form-group">
          <label class="form-label">별점</label>
          <div class="star-wrapper" @mousemove="$_onStarHover" @mouseleave="hoverScore = 0">
            <img
              v-for="idx in 5"
              :key="idx"
              :src="getStarImage(idx)"
              @click="onStarClick($event, idx)"
              class="star-icon"
              :ref="setStars"
              alt="별점"
            />
            <span class="star-score">({{ selectedStarNum }}점)</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label"
            ><i class="fa-regular fa-image"></i>&nbsp;이미지 첨부 (선택)</label
          >
          <input
            type="file"
            class="form-control"
            multiple
            accept="image/png, image/jpeg"
            @change="onFileChange"
            ref="fileInput"
          />
          <div class="preview-list">
            <div v-for="(url, i) in previews" :key="i" class="preview-box">
              <img :src="url" class="preview-img" />
              <button class="btn-preview-remove" @click="removeFile(i)" type="button">
                <i class="fa-solid fa-xmark" style="color: #666"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">리뷰 내용</label>
          <textarea
            class="form-control textarea"
            v-model="form.content"
            placeholder="내용을 입력하세요"
            required
          ></textarea>
        </div>

        <div class="btn-wrap">
          <button type="submit" class="btn-submit">
            {{ isEdit ? '수정 완료' : '등록' }}
          </button>
          <button type="button" class="btn-cancel" @click="$router.back()">취소</button>
        </div>
      </form>
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
    }
  },
  mounted() {
    const id = this.$route.params.id

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
  methods: {
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
        authStore.logout()
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
        authStore.logout()
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
.hotplace-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}
.hotplace-form-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px 32px 32px 32px;
}
.hotplace-form-title {
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 32px;
  letter-spacing: -1px;
}
.hotplace-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
  border-top: 2px solid #696969;
  padding-top: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.form-star-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.form-label {
  font-size: 1.05rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}
.form-control {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border 0.18s;
  resize: none;
  background: #fff;
}
.form-control:focus {
  border-color: #8cae99;
  outline: none;
  background: #fff;
}
.textarea {
  min-height: 180px;
  font-family: inherit;
}
.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-search-place {
  background: #fff;
  color: #222;
  border: 1.5px solid #222;
  border-radius: 6px;
  padding: 7px 18px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
}
.btn-search-place:hover {
  background: #4a98e4;
  color: #fff;
}
.selected-place {
  color: #888;
  font-size: 1rem;
}
.star-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
.star-icon {
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s;
}
.star-score {
  color: #888;
  font-size: 1rem;
  margin-left: 8px;
}
.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}
.preview-box {
  position: relative;
}
.preview-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}
.btn-preview-remove {
  position: absolute;
  top: -10px;
  right: -6px;
  background-color: white;
  border-radius: 50%;
  padding: 0;
  border: 1px solid #ccc;
  width: 22px;
  height: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-preview-remove i {
  font-size: 1.1rem;
  display: block;
  margin: 0 auto;
  line-height: 1;
}
.btn-wrap {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}
.btn-submit {
  background-color: #9dbbaa;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-submit:hover {
  background-color: #aacab8;
}
.btn-cancel {
  background: #ededed;
  color: #666;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
}
.btn-cancel:hover {
  background: #b0b0b0;
  color: #fff;
}
@media (max-width: 700px) {
  .hotplace-form-container,
  .hotplace-form-card {
    padding: 12px 4px;
  }
  .hotplace-form-title {
    font-size: 1.2rem;
  }
}
</style>
