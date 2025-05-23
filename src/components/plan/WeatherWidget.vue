<template>
  <div class="weather-widget" v-if="weather">
    <img :src="weather.icon" alt="날씨 아이콘" />
    <div class="weather-info">
      <small>{{ props.sido }}의 날씨</small><br />
      <strong>{{ weather.temp }}°C </strong>
      <strong>{{ weather.desc }}</strong>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps(['sido', 'gugun'])
const weather = ref(null)

const fetchWeather = async () => {
  if (!props.sido || !props.gugun) return

  const sidoMap = {
    서울: 'Seoul',
    인천: 'Incheon',
    경기: 'Gyeonggi-do',
    강원특별자치도: 'Gangwon-do',
    충청북도: 'Chungcheongbuk-do',
    충청남도: 'Chungcheongnam-do',
    대전: 'Daejeon',
    세종특별자치시: 'Sejong',
    전북특별자치도: 'Jeollabuk-do',
    전라남도: 'Jeollanam-do',
    광주: 'Gwangju',
    대구: 'Daegu',
    경상북도: 'Gyeongsangbuk-do',
    경상남도: 'Gyeongsangnam-do',
    부산: 'Busan',
    울산: 'Ulsan',
    제주도: 'Jeju',
  }

  const baseCity = sidoMap[props.sido] || props.sido
  const query = `${baseCity} ${props.gugun}`

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${baseCity}&appid=5d9b3b800dfed24a20f68eeb480f5d9d&units=metric&lang=kr`,
      console.log(query),
    )
    const data = await response.json()
    if (data.cod !== 200) {
      console.error('OpenWeatherMap 응답 오류:', data.message)
      return
    }
    weather.value = {
      temp: data.main.temp.toFixed(1),
      desc: data.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    }
  } catch (err) {
    console.error('날씨 불러오기 실패:', err)
  }
}

onMounted(fetchWeather)
watch(() => `${props.sido}-${props.gugun}`, fetchWeather)
</script>

<style scoped>
.weather-widget {
  position: absolute;
  top: 150px;
  right: 20px;
  background: #ffffffcc;
  border-radius: 12px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'GowunDodum-Regular', sans-serif;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.weather-widget img {
  width: 48px;
  height: 48px;
}
.weather-info strong {
  font-size: 18px;
}
.weather-info small {
  font-size: 13px;
  color: #555;
}
</style>
