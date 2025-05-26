<template>

    <div class="hotplace-top-writers">
  <div class="title">🔥 이달의 핫플왕 🔥</div>
  <div class="scroll-wrapper">
    <ul
  class="scroll-list"
  :class="{ 'with-transition': transitionEnabled }"
  :style="{ transform: `translateY(-${currentIndex * 30}px)` }"
>
  <li v-for="(user, idx) in animatedWriters" :key="idx">{{ user }}</li>
</ul>
  </div>
</div>

  <div class="main-container">
    
    <RegionForm
      :sido="sido"
      :gugun="gugun"
      :areaData="areaData"
      @update-sido="handleSidoChange"
      @update-gugun="gugun = $event"
      @submit-form="submitForm"
      @reset-map="resetMap"
    />
    <KoreaMap
      :selectedSido="sido"
      :selectedGugun="gugun"
      @update-sido="handleSidoChange"
      @update-gugun="handleGugunChange"
      @reset-map="resetMap"
    />
  </div>
</template>

<script>
import RegionForm from '@/components/home/RegionForm.vue'
import KoreaMap from '@/components/home/KoreaMap.vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  components: { RegionForm, KoreaMap },
  data() {
    return {
      sido: '',
      gugun: '',
      attId: 0,
      topWriters: [],
      animatedWriters: [],
    currentIndex: 0,
    intervalId: null,
    transitionEnabled: true,
      areaData: {
        서울: [
          '강남구',
          '강동구',
          '강북구',
          '강서구',
          '관악구',
          '광진구',
          '구로구',
          '금천구',
          '노원구',
          '도봉구',
          '동대문구',
          '동작구',
          '마포구',
          '서대문구',
          '서초구',
          '성동구',
          '성북구',
          '송파구',
          '양천구',
          '영등포구',
          '용산구',
          '은평구',
          '종로구',
          '중구',
          '중랑구',
        ],
        인천: [
          '계양구',
          '미추홀구',
          '남동구',
          '동구',
          '부평구',
          '서구',
          '연수구',
          '중구',
          '강화군',
          '옹진군',
        ],
        대전: ['대덕구', '동구', '서구', '유성구', '중구'],
        대구: ['남구', '달서구', '동구', '북구', '서구', '수성구', '중구', '달성군', '군위군'],
        광주: ['광산구', '남구', '동구', '북구', '서구'],
        부산: [
          '강서구',
          '금정구',
          '남구',
          '동구',
          '동래구',
          '부산진구',
          '북구',
          '사상구',
          '사하구',
          '서구',
          '수영구',
          '연제구',
          '영도구',
          '중구',
          '해운대구',
          '기장군',
        ],
        울산: ['남구', '동구', '북구', '중구', '울주군'],
        세종특별자치시: ['세종특별자치시'],
        경기도: [
          '고양시',
          '과천시',
          '광명시',
          '광주시',
          '구리시',
          '군포시',
          '김포시',
          '남양주시',
          '동두천시',
          '부천시',
          '성남시',
          '수원시',
          '시흥시',
          '안산시',
          '안성시',
          '안양시',
          '양주시',
          '오산시',
          '용인시',
          '의왕시',
          '의정부시',
          '이천시',
          '파주시',
          '평택시',
          '포천시',
          '하남시',
          '화성시',
          '가평군',
          '양평군',
          '여주시',
          '연천군',
        ],
        강원특별자치도: [
          '강릉시',
          '동해시',
          '삼척시',
          '속초시',
          '원주시',
          '춘천시',
          '태백시',
          '고성군',
          '양구군',
          '양양군',
          '영월군',
          '인제군',
          '정선군',
          '철원군',
          '평창군',
          '홍천군',
          '화천군',
          '횡성군',
        ],
        충청북도: [
          '제천시',
          '청주시',
          '충주시',
          '괴산군',
          '단양군',
          '보은군',
          '영동군',
          '옥천군',
          '음성군',
          '증평군',
          '진천군',
        ],
        충청남도: [
          '계룡시',
          '공주시',
          '논산시',
          '보령시',
          '서산시',
          '아산시',
          '천안시',
          '금산군',
          '당진시',
          '부여군',
          '서천군',
          '예산군',
          '청양군',
          '태안군',
          '홍성군',
        ],
        경상북도: [
          '경산시',
          '경주시',
          '구미시',
          '김천시',
          '문경시',
          '상주시',
          '안동시',
          '영주시',
          '영천시',
          '포항시',
          '고령군',
          '봉화군',
          '성주군',
          '영덕군',
          '영양군',
          '예천군',
          '울릉군',
          '울진군',
          '의성군',
          '청도군',
          '청송군',
          '칠곡군',
        ],
        경상남도: [
          '거제시',
          '김해시',
          '밀양시',
          '사천시',
          '양산시',
          '진주시',
          '창원시',
          '통영시',
          '거창군',
          '고성군',
          '남해군',
          '산청군',
          '의령군',
          '창녕군',
          '하동군',
          '함안군',
          '함양군',
          '합천군',
        ],
        전북특별자치도: [
          '군산시',
          '김제시',
          '남원시',
          '익산시',
          '전주시',
          '정읍시',
          '고창군',
          '무주군',
          '부안군',
          '순창군',
          '완주군',
          '임실군',
          '장수군',
          '진안군',
        ],
        전라남도: [
          '광양시',
          '나주시',
          '목포시',
          '순천시',
          '여수시',
          '강진군',
          '고흥군',
          '곡성군',
          '구례군',
          '담양군',
          '무안군',
          '보성군',
          '신안군',
          '영광군',
          '영암군',
          '완도군',
          '장성군',
          '장흥군',
          '진도군',
          '함평군',
          '해남군',
          '화순군',
        ],
        제주도: ['서귀포시', '제주시'],
      },
    }
  },
  methods: {
    handleSidoChange(newSido) {
      this.sido = newSido
      this.gugun = ''
    },
    handleGugunChange(newGugun) {
      this.gugun = newGugun
    },
    resetMap() {
      this.sido = ''
      this.gugun = ''
    },
    submitForm() {
      if (!this.sido || !this.gugun) {
        alert('모두 선택해주세요')
        return
      }
      const authStore = useAuthStore()

      axios
        .post(
          '/api/att/attplan',
          {
            sido: this.sido,
            gugun: this.gugun,
            att_id: this.attId,
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          },
        )
        .then((res) => {
          const places = res.data

          this.$router.push({
            name: 'MyPlanPage',
            query: {
              sido: this.sido,
              gugun: this.gugun,
              att_id: this.attId,
            },
            state: {
              places: places,
            },
          })
        })
        .catch((err) => {
          alert('관광지 조회 실패')
          console.error(err)
        })
    },
    async fetchTopWriters() {
  try {
    const res = await fetch('/api/hotplace/top-writers')
    const data = await res.json()
    const names = data.map((item, idx) => ` ${idx + 1}위 ${item.memberId} (${item.postCount}개)`)

    this.topWriters = names
    this.animatedWriters = [...names, names[0]] // 마지막에 첫 번째 항목 복제

    this.startAutoScroll()
  } catch (err) {
    console.error('TOP 작성자 불러오기 실패:', err)
  }
},

startAutoScroll() {
  this.intervalId = setInterval(() => {
    if (this.currentIndex < this.animatedWriters.length - 1) {
      this.transitionEnabled = true
      this.currentIndex++
    } else {
      this.transitionEnabled = false
      this.currentIndex = 0

      this.$nextTick(() => {
        setTimeout(() => {
          this.transitionEnabled = true
          this.currentIndex = 1
        }, 20)
      })
    }
  }, 2000)
}

  },
  mounted() {
    if (!window.location.pathname.includes('/attplan')) {
      localStorage.removeItem('planItems')
      localStorage.removeItem('editPlan')
    }
    this.fetchTopWriters()
  },
  beforeUnmount() {
  clearInterval(this.intervalId)
},
}
</script>

<style>
.main-container {
  max-width: 100%;
  margin: 30px auto;
  background-color: #ececec;
  border-radius: 6px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  overflow: hidden;
  flex-wrap: wrap;
}

.hotplace-top-writers {
  margin: 0 auto 30px;
  text-align: center;
  font-family: 'GowunDodum-Regular', sans-serif;
}

.hotplace-top-writers .title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #ff5722;
  font-size: 18px;
}

.scroll-wrapper {
  height: 30px;
  overflow: hidden;
  position: relative;
}

.scroll-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.scroll-list.with-transition {
  transition: transform 0.3s ease-in-out;
}

.scroll-list li {
  height: 30px;
  line-height: 30px;
  font-size: 16px;
  color: #333;
  white-space: nowrap;
}

</style>
