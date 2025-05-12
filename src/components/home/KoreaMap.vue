<template>
  <div class="map-section">
    <object id="koreaMap" type="image/svg+xml" data="/img/kr.svg" @load="onSvgLoad"></object>
  </div>
</template>

<script>
export default {
  props: ['selectedSido'],
  data() {
    return {
      svgDoc: null,
      sidoMap: {
        KR11: '서울',
        KR28: '인천',
        KR41: '경기도',
        KR42: '강원특별자치도',
        KR43: '충청북도',
        KR44: '충청남도',
        KR30: '대전',
        KR50: '세종특별자치시',
        KR45: '전북특별자치도',
        KR46: '전라남도',
        KR29: '광주',
        KR27: '대구',
        KR47: '경상북도',
        KR48: '경상남도',
        KR26: '부산',
        KR31: '울산',
        KR49: '제주도',
      },
    }
  },
  methods: {
    onSvgLoad(event) {
      this.svgDoc = event.target.contentDocument
      Object.keys(this.sidoMap).forEach((id) => {
        const region = this.svgDoc.getElementById(id)
        if (region) {
          region.style.cursor = 'pointer'

          region.addEventListener('mouseenter', () => {
            if (this.selectedSido !== this.sidoMap[id]) {
              region.setAttribute('transform', 'scale(1.005 )')
              region.style.strokeWidth = '3px'
              region.style.filter = 'brightness(1.3)'
              region.style.transition = 'transform 1s ease'
            }
          })

          region.addEventListener('mouseleave', () => {
            if (this.selectedSido !== this.sidoMap[id]) {
              region.removeAttribute('transform')
              region.style.strokeWidth = ''
              region.style.filter = ''
            }
          })

          region.addEventListener('click', () => {
            const name = this.sidoMap[id]
            this.$emit('region-click', name)
          })
        }
      })
    },
  },
  watch: {
    selectedSido(newVal) {
      if (!this.svgDoc) return
      Object.keys(this.sidoMap).forEach((id) => {
        const region = this.svgDoc.getElementById(id)
        if (region) {
          if (this.sidoMap[id] === newVal) {
            region.style.filter = 'brightness(1.3)'
            region.setAttribute('transform', 'scale(1.005)')
            region.style.strokeWidth = '3px'
          } else {
            region.style.filter = ''
            region.removeAttribute('transform')
            region.style.strokeWidth = ''
          }
        }
      })
    },
  },
}
</script>

<style scoped>
.map-section {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.map-section svg path {
  transition: fill 0.3s ease;
}
</style>
