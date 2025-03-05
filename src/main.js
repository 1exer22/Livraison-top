import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/styles/main.scss";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  // Your Firebase config here
};

initializeApp(firebaseConfig);

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");
