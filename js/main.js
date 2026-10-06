// main.js

import { initTodoApp } from "./todoApp.js";
import { initGameApp } from "./gameApp.js";
import { initNotepadApp } from "./notepadApp.js";
import { initPaintApp } from "./paintApp.js";
import { initCalcApp } from "./calcApp.js";
import { initBbsApp } from "./bbsApp.js";
import { initWeatherApp } from "./weatherApp.js";
import { initWindowEngine, loadDesktopStateFromLocal } from "./windowSystem.js";

initWindowEngine();

/**
 * キリ番表示
 */
const countNumber = document.querySelector("#countNumber");

if (countNumber) {
  let currentCount = localStorage.getItem("visitCount");

  if (currentCount === null) {
    currentCount = 0;
  } else {
    currentCount = Number(currentCount);
  }

  currentCount = currentCount + 1;

  localStorage.setItem("visitCount", currentCount);

  countNumber.textContent = String(currentCount).padStart(6, "0");

  const isHundred = currentCount % 100 === 0;
  const isZorome = currentCount >= 11 &&
    String(currentCount).split("").every(function (char) {
      return char === String(currentCount)[0];
    });

  if (isHundred || isZorome) {

    const now = new Date();
    const dateStr = now.toLocaleDateString("ja-JP") + " " + now.toLocaleTimeString("ja-JP");

    fetch('save_log.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'counter', value: currentCount })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('ログ保存失敗: ${response.status}');
        }
        return response.text();
      })
      .then(data => {
        console.log('キリ番ログ自動送信成功:', data);

        // キリ番もリアルタイムでBBSの先頭に差し込む
        const newPost = document.createElement("div");
        newPost.className = "bbs_post";
        newPost.innerHTML = `<span class='bbs_icon'>🐾</span> <span class='bbs_name'>システム通知</span> : ${dateStr} <br> 祝！【${currentCount}人目】のキリ番・ゾロ目を踏みました！`;

        const bbsList = document.querySelector("#bbsList");
        bbsList.prepend(newPost);
      })
      .catch(error => {
        console.error('キリ番ログ送信エラー:', error);
      });

    setTimeout(function () {
      alert(`祝！あなたは【${currentCount}人目】のキリ版を踏みました！BBSへ報告してください！`);
    }, 500);
  }
}

/**
 * マウスについてくるキラキラ
 */
window.addEventListener("mousemove", function (e) {
  const star = document.createElement("span");
  star.className = "sparkle";
  star.textContent = "★";

  star.style.left = e.pageX + "px";
  star.style.top = e.pageY + "px";

  document.body.appendChild(star);

  setTimeout(function () {
    star.style.transform = `translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) scale(0.5)`;
    star.style.opacity = "0";
  }, 10);

  this.setTimeout(function () {
    star.remove();
  }, 1000);
});

initTodoApp();
initGameApp();
initNotepadApp();
initPaintApp();
initCalcApp();
initBbsApp();
initWeatherApp();

// 起動時に前回の配置を復元
loadDesktopStateFromLocal();