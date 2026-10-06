/** 
* 掲示板
*/

import { element } from "./domUtils.js";

export function initBbsApp() {
  const bbsInputMessage = document.querySelector("#bbsInputMessage");
  const btnBbsSend = document.querySelector("#btnBbsSend");
  const bbsList = document.querySelector("#bbsList");

  if (!bbsInputMessage || !btnBbsSend || !bbsList) return;

  btnBbsSend.addEventListener("click", function () {
    const text = bbsInputMessage.value.trim();

    if (text === "") {
      alert("文字を入力してください！");
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString("ja-JP") + " " + now.toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' });

    const logMessage = `名無しさん＠お腹いっぱい : ${dateStr} <br> ${text}`;

    fetch('save_log.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'bbs', value: text })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('投稿失敗: ${response.status}');
        }
        return response.text();
      })
      .then(data => {
        console.log('BBS投稿フィードバック:', data);

        const newPostElement = element`
        <div class="bbs_post">
        <span class="bbs_icon">💬</span>
        <span class="bbs_name">名無しさん＠お腹いっぱい</span> : ${dateStr} <br>
        ${text}
        </div>
        `;

        bbsList.prepend(newPostElement);

        bbsInputMessage.value = "";
        bbsInputMessage.focus();
      })
      .catch(error => {
        console.error('BBS投稿エラー:', error);
      });
  });

  bbsInputMessage.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.isComposing) {
      e.preventDefault();
      btnBbsSend.click();
    }
  });
}