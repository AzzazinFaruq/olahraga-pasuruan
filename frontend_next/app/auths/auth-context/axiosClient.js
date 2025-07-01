"use client";

import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080",       // ganti sesuai API kamu
  withCredentials: true,                  // agar cookie terkirim
  xsrfCookieName: "XSRF-TOKEN",           // nama cookie XSRF dari server
  xsrfHeaderName: "X-XSRF-TOKEN",         // header yang akan dikirim ke server
  headers: {
    "Content-Type": "application/json",
  },
});

axios.defaults.baseURL =  'http://localhost:8080';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';


export default axiosClient;
