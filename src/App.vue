<template>
  <div id="app">

    <Header />

    <router-view />

  </div><!-- app -->
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters({
      config: 'getConfig',
      network: 'getNetwork',
    }),
  },
  components: {
  },
  methods: {
  },
  created () {
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto:400,500,700');
#app {
  font-family: 'Roboto', sans-serif !important;
  background-color: #ECECEC;
  color: #434343;
}
.error-text {
  color: #dc3545;
}

.color-green {
  color: #4e9e74 !important;
}

.color-light-green {
  color: #caefc4 !important;
}

.color-red {
  color: #dc3545 !important;
}

.color-gray {
  color: #a0a0a0 !important;
}

.color-dark-gray {
  color: #6c757d !important;
}

.color-white {
  color: #FFF !important;
}

.bg-white {
  background-color: #FFF;
}



</style>
