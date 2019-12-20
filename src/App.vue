<template>
  <div id="app">
    <div id="nav">
        <router-link to="/">Home</router-link> |
      <router-link to="/movies">Movies</router-link> |
      <router-link to="/saved">Saved</router-link>
    </div>
    <router-view/>
  </div>
</template>

<script>
import Vue from "vue";
import Table from "@/components/Table";
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue-image-lightbox/dist/vue-image-lightbox.min.css'
import VueLazyLoad from "vue-lazyload";
Vue.use(VueLazyLoad);
Vue.use(BootstrapVue)
Vue.component('custom-table', Table)

export default {
    
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
