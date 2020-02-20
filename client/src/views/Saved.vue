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
        norowsfound: "Saves",
        searchname: "Saves",
        remoteURL:
          window.location.protocol +
          "//" +
          window.location.hostname +
          ":3001/movies",
        remoteParams: "&rating_gte=1",
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
