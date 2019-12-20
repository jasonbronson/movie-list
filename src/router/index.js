import Vue from "vue";
import Router from "vue-router";
import Movies from "../views/Movies";
import Saved from "../views/Saved";
import Home from "../views/Home";


Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home
    },
    {
        path: "/movies",
        name: "Movies",
        component: Movies
    },
    {
      path: "/saved",
      name: "Saved",
      component: Saved
    }
  ]
});
