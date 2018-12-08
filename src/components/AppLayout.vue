<template>

<div>

<b-navbar toggleable="md" type="dark" variant="info">

  <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

  <b-navbar-brand href="#">KuSwap</b-navbar-brand>

</b-navbar>

<!-- navbar-1.vue -->
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
