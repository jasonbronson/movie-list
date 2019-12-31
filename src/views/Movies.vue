<template>
  <div class="movies">
    <custom-table :props="props"></custom-table>
  </div>
</template>

<script>
export default {
  name: "movies",
  data() {
    return {
      props: {
        norowsfound: "Movies",
        searchname: "Movies",
        remoteURL: "http://192.168.1.69:3000/movies",
        isLoading: false
      }
    };
  }
};
</script>

<style>
.logo {
  height: 200px;
}
.heading {
  font-weight: 500;
  font-size: 18px;
  color: black;
}
</style>
