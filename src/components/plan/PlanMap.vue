<template>
  <div class="map-box">
    <h4>📊 {{ areaName }}</h4>
    <div ref="mapContainer" style="width: 100%; height: 480px"></div>
  </div>
</template>

<script>
export default {
  props: ['markers', 'areaName', 'planMarkers'],
  data() {
    return {
      map: null,
      mapMarkers: [],
      currentInfowindow: null,
      currentMarker: null,
    }
  },
  watch: {
    markers: {
      handler() {
        this.decideAndRenderMarkers()
      },
      immediate: true,
      deep: true,
    },
    planMarkers: {
      handler() {
        console.log('planMarkers 변경 감지됨:', this.planMarkers)
        this.decideAndRenderMarkers()
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {
    if (window.kakao && window.kakao.maps) {
      this.$nextTick(() => this.initMap())
    } else {
      const script = document.createElement('script')
      script.src =
        '//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=dc1114296c501aaa901df7d025c27fba'
      script.onload = () => {
        window.kakao.maps.load(() => {
          this.$nextTick(() => this.initMap())
        })
      }
      document.head.appendChild(script)
    }
  },
  methods: {
    initMap() {
      const container = this.$refs.mapContainer
      if (!container) return

      this.map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(36.5, 127.5), // 중간 위치
        level: 12,
      })

      this.decideAndRenderMarkers()
    },
    decideAndRenderMarkers() {
      if (!this.map) return;

      // 기존 마커 제거
      this.mapMarkers.forEach(({ marker, infowindow }) => {
        if (infowindow) infowindow.close();
        marker.setMap(null);
      });
      this.mapMarkers = [];

      if (this.planMarkers && this.planMarkers.length > 0) {
        this.renderPlanMarkers(this.planMarkers);
      } else {
        this.renderMarkers(this.markers);
      }
    },
    renderMarkers(markerDataList) {
      this.mapMarkers.forEach(({marker}) => marker.setMap(null))
      this.mapMarkers = []

      const bounds = new window.kakao.maps.LatLngBounds()
      let latitudes = 0
      let longitudes = 0

      markerDataList.forEach((data) => {
        const latitude = data.latitude
        const longitude = data.longitude
        const position = new window.kakao.maps.LatLng(latitude, longitude)

        // 이상치 필터링
        if (latitudes === 0 && longitudes === 0) {
          latitudes = latitude
          longitudes = longitude
          bounds.extend(position)
        } else {
          if (
            latitude > latitudes * 1.05 ||
            latitude < latitudes * 0.95 ||
            longitude > longitudes * 1.05 ||
            longitude < longitudes * 0.95
          ) {
            console.log('Outlier removed:', latitude, longitude)
            return // 마커 생성/추가 스킵
          } else {
            bounds.extend(position)
            latitudes = latitude
            longitudes = longitude
          }
        }

        const marker = new window.kakao.maps.Marker({
          map: this.map,
          position,
          image: new window.kakao.maps.MarkerImage(
            '/resource/marker.png',
            new window.kakao.maps.Size(30, 30),
            { offset: new window.kakao.maps.Point(22, 0) },
          ),
        })

        marker.setVisible(false)
        this.mapMarkers.push({marker})
      })

      if (this.mapMarkers.length > 0) {
        this.map.setBounds(bounds)
      }
    },

    renderPlanMarkers(markerDataList) {
      this.mapMarkers.forEach(({ marker }) => marker.setMap(null))
      this.mapMarkers = []

      const bounds = new window.kakao.maps.LatLngBounds()
      let latitudes = 0
      let longitudes = 0

      markerDataList.forEach((data) => {
        const latitude = data.latitude
        const longitude = data.longitude
        const position = new window.kakao.maps.LatLng(latitude, longitude)

        // 이상치 필터링
        if (latitudes === 0 && longitudes === 0) {
          latitudes = latitude
          longitudes = longitude
          bounds.extend(position)
        } else {
          if (
            latitude > latitudes * 1.05 ||
            latitude < latitudes * 0.95 ||
            longitude > longitudes * 1.05 ||
            longitude < longitudes * 0.95
          ) {
            console.log('Outlier removed:', latitude, longitude)
            return
          } else {
            bounds.extend(position)
            latitudes = latitude
            longitudes = longitude
          }
        }

        const marker = new window.kakao.maps.Marker({
          map: this.map,
          position,
          image: new window.kakao.maps.MarkerImage(
            '/resource/marker.png',
            new window.kakao.maps.Size(30, 30),
            { offset: new window.kakao.maps.Point(22, 0) },
          ),
        })

        marker.setVisible(true)

        const imageSrc = data.first_image1 ? data.first_image1 : '/resource/tripimage.png'

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `
            <div style="font-size:14px;">
              <strong>${data.title}</strong><br>
              <img src="${imageSrc}" width="100" height="70"><br>
            </div>
          `,
        })

        window.kakao.maps.event.addListener(marker, 'click', () => {
          if (this.currentInfowindow) {

            if (this.currentInfowindow.getContent() === infowindow.getContent()) {
              this.currentInfowindow.close()
              this.currentInfowindow = null
              return
            }

            this.currentInfowindow.close()

          }

          infowindow.open(this.map, marker)
          this.currentInfowindow = infowindow
        })
        this.mapMarkers.push({ marker, infowindow }) 
      })

      if (this.mapMarkers.length > 0) {
        this.map.setBounds(bounds)
      }
    },
  },
}
</script>

<style scoped>
.map-box {
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 40px;
}

.map-box h4 {
  margin-bottom: 20px;
  font-weight: 700;
}
</style>
