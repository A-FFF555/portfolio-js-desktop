// 各アプリの関連要素を構造化データとして定義
// apps.js

export const apps = [
  { id: 'game', container: document.querySelector(".game_container"), icon: document.querySelector("#iconGame"), taskBtn: document.querySelector("#taskBtnGame") },
  { id: 'notepad', container: document.querySelector(".notepad_container"), icon: document.querySelector("#iconNote"), taskBtn: document.querySelector("#taskBtnNote") },
  { id: 'paint', container: document.querySelector(".paint_container"), icon: document.querySelector("#iconPaint"), taskBtn: document.querySelector("#taskBtnPaint") },
  { id: 'calc', container: document.querySelector(".calc_container"), icon: document.querySelector("#iconCalc"), taskBtn: document.querySelector("#taskBtnCalc") },
  { id: 'bbs', container: document.querySelector(".bbs_container"), icon: document.querySelector("#iconBbs"), taskBtn: document.querySelector("#taskBtnBbs") },
  { id: 'weather', container: document.querySelector(".weather_container"), icon: document.querySelector("#iconWeather"), taskBtn: document.querySelector("#taskBtnWeather") },
  { id: 'todo', container: document.querySelector(".todo_container"), icon: document.querySelector("#iconTodo"), taskBtn: document.querySelector("#taskBtnTodo") }
];