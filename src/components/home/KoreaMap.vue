<template>
  <div class="map-section">
    <transition name="fade" mode="out-in">
      <object
        :key="svgPath"
        id="koreaMap"
        type="image/svg+xml"
        :data="svgPath"
        @load="onSvgLoad"
        class="svg-object"
      ></object>
    </transition>
  </div>
</template>

<script>
export default {
  props: ['selectedSido', 'selectedGugun'],
  emits: ['region-click', 'update-sido', 'update-gugun'],
  data() {
    return {
      svgDoc: null,
      svgPath: '/resource/kr.svg',
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

      if (this.svgPath.includes('kr.svg')) {
        Object.keys(this.sidoMap).forEach((id) => {
          const region = this.svgDoc.getElementById(id)
          if (region) {
            region.style.cursor = 'pointer'

            region.addEventListener('mouseenter', () => {
              if (this.selectedSido !== this.sidoMap[id]) {
                region.setAttribute('transform', 'scale(1.005)')
                region.style.strokeWidth = '3px'
                region.style.filter = 'brightness(1.3)'
                region.style.transition = 'transform 0.5s ease'
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
              this.svgPath = `/resource/${name}.svg`
              this.$emit('update-sido', name)
            })
          }
        })
      } else {
        const paths = this.svgDoc.querySelectorAll('path[id]')
        paths.forEach((path) => {
          const name = path.getAttribute('id')
          if (!name) return

          path.style.cursor = 'pointer'

          path.addEventListener('mouseenter', () => {
            if (this.selectedGugun !== name) {
              path.setAttribute('transform', 'scale(1.005)')
              path.style.strokeWidth = '3px'
              path.style.filter = 'brightness(1.3)'
              path.style.transition = 'transform 0.5s ease'
            }
          })

          path.addEventListener('mouseleave', () => {
            if (this.selectedGugun !== name) {
              path.removeAttribute('transform')
              path.style.strokeWidth = ''
              path.style.filter = ''
            }
          })

          path.addEventListener('click', () => {
            this.$emit('update-gugun', name)
          })
        })
      }
    },
  },
  watch: {
    selectedSido(newVal) {
      if (newVal === '') {
        this.svgPath = '/resource/kr.svg'
        return
      }

      const foundId = Object.keys(this.sidoMap).find((id) => this.sidoMap[id] === newVal)
      if (foundId) {
        this.svgPath = `/resource/${newVal}.svg`
      }
    },
    selectedGugun(newVal) {
      if (!this.svgDoc || this.svgPath === '/resource/kr.svg') return

      const paths = this.svgDoc.querySelectorAll('path[id]')
      paths.forEach((path) => {
        const name = path.getAttribute('id')
        if (!name) return

        if (name === newVal) {
          path.setAttribute('transform', 'scale(1.005)')
          path.style.strokeWidth = '3px'
          path.style.filter = 'brightness(1.3)'
        } else {
          path.removeAttribute('transform')
          path.style.filter = ''
          path.style.stroke = ''
          path.style.strokeWidth = ''
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

  width: 800px;
  height: 655px;
  max-width: 100%;
  box-sizing: border-box;
}

.svg-object {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
