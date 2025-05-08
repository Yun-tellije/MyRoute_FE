<template>
  <div class="result-container">
    <h1 class="text-center py-4">나만의 계획 세우기</h1>

    <!-- 지역 선택 -->
    <form @submit.prevent="searchPlaces">
      <div class="d-flex gap-2 align-items-center mb-4">
        <select v-model="selectedGugun" class="form-select" style="max-width: 300px;">
          <option disabled value="">군구 선택</option>
          <option v-for="gugun in gugunList" :key="gugun" :value="gugun">{{ gugun }}</option>
        </select>
        <button class="btn btn-primary" type="submit">조회 하기</button>
      </div>
    </form>

    <!-- 지도 영역 -->
    <div class="map-box mb-4">
      <h4>📊 {{ sido }} {{ selectedGugun }}</h4>
      <div id="map" style="width:100%; height:480px;"></div>
    </div>

    <!-- 관광지 목록과 계획 리스트 -->
    <div class="row">
      <!-- 추천 관광지 -->
      <div class="col-md-8">
        <h4 class="mb-4">🌟 추천 관광지 목록</h4>

        <div class="place-list-scroll">
          <div class="row g-4">
            <div class="col-md-6" v-for="place in placeList" :key="place.no">
              <div class="place-card">
                <img :src="place.first_image1 || defaultImage" :alt="place.title" />
                <div class="place-info">
                  <h5>{{ place.title }}</h5>
                  <p>{{ place.content_type_name }}</p>
                  <p>{{ place.addr1 }}</p>
                  <button class="btn btn-sm btn-outline-success" @click="addToPlan(place)">➕ 추가</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 나의 계획 -->
      <div class="col-md-4 place-list-scroll">
        <h4 class="mb-4">🗓️ 나의 계획</h4>
        <div class="card shadow-sm p-3" id="planList">
          <p v-if="planList.length === 0" class="text-muted">아직 추가된 관광지가 없습니다.</p>
          <div v-for="item in planList" :key="item.no" class="card mb-2 plan-item">
            <div class="card-body p-2 d-flex align-items-center">
              <img :src="item.image" class="me-2" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
              <div>
                <strong>{{ item.title }}</strong><br />
                <small>{{ item.addr }}</small>
              </div>
              <button class="btn btn-sm btn-outline-danger ms-auto" @click="removeFromPlan(item.no)">✖</button>
            </div>
          </div>
        </div>
        <div class="d-grid mt-3">
          <button class="btn btn-success" @click="savePlan">📝 계획 생성하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, reactive, ref } from 'vue';
import axios from 'axios';

export default {
  name: 'MyPlanPage',
  setup() {
    const sido = new URLSearchParams(window.location.search).get('sido') || '';
    const gugunListMap = {
      서울: ['강남구', '서초구', '마포구', '종로구', '중구'],
      // ... (전체 지역 데이터 추가 필요)
    };

    const gugunList = gugunListMap[sido] || [];
    const selectedGugun = ref('');
    const planList = ref([]);
    const placeList = ref([]);
    const defaultImage = '/resource/tripimage.png';

    const searchPlaces = async () => {
      try {
        const res = await axios.post('/att/attplan', {
          sido,
          gugun: selectedGugun.value,
          att_id: 0
        });
        placeList.value = res.data;
        renderMap();
      } catch (err) {
        alert('조회 실패');
        console.error(err);
      }
    };

    const addToPlan = (place) => {
      if (!planList.value.some(p => p.no === place.no)) {
        planList.value.push({
          title: place.title,
          addr: place.addr1,
          image: place.first_image1 || defaultImage,
          latitude: place.latitude,
          longitude: place.longitude,
          no: place.no
        });
        localStorage.setItem('planItems', JSON.stringify(planList.value));
      }
    };

    const removeFromPlan = (no) => {
      planList.value = planList.value.filter(p => p.no !== no);
      localStorage.setItem('planItems', JSON.stringify(planList.value));
    };

    const savePlan = async () => {
      if (planList.value.length === 0) {
        alert('계획에 담긴 관광지가 없습니다!');
        return;
      }

      try {
        await axios.post('/att/savePlan', planList.value);
        alert('📝 계획이 성공적으로 저장되었습니다!');
        localStorage.removeItem('planItems');
        planList.value = [];
      } catch (err) {
        console.error(err);
        alert('저장 중 오류 발생');
      }
    };

    const renderMap = () => {
      const mapContainer = document.getElementById('map');
      if (!mapContainer) return;
      const map = new window.kakao.maps.Map(mapContainer, {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 5,
      });
    };

    onMounted(() => {
      planList.value = JSON.parse(localStorage.getItem('planItems') || '[]');
      const script = document.createElement('script');
      script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=dc1114296c501aaa901df7d025c27fba';
      script.onload = renderMap;
      document.head.appendChild(script);
    });

    return {
      sido,
      gugunList,
      selectedGugun,
      planList,
      placeList,
      searchPlaces,
      addToPlan,
      removeFromPlan,
      savePlan,
      defaultImage
    };
  }
};
</script>

<style scoped>
/* 기존 CSS 유지 or Tailwind로 재작성 */
</style>
