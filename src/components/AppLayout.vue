<template>

<div>

  <div class="p-3 text-center bg-white">
    <img src="static/images/logo.png" with="232" height="67">
  </div>


    <div>

       <router-view :key="key" />

    </div>


</div>

</template>

<script>

export default {
  name: 'AppLayout',
  data () {
    return {
    }
  },
  computed: {
    key: function () {
      const now = (new Date()).getTime()
      return this.$route.name !== undefined
        ? this.$route.name + '-' + now
        : this.$route + '-' + now
    }
  },
  components: {
  },
  methods: {
  },
  created () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
