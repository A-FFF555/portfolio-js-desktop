/**
 * 数当てゲーム
 * gameApp.js
 */
let answerNumber = Math.floor(Math.random() * 100) + 1;
let inputHistory = [];
const secretCommand = "cheat";

export function initGameApp() {
  const inputNumber = document.querySelector("#inputNumber");
  const btn = document.querySelector("#btn");
  const resultMessage = document.querySelector("#resultMessage");
  const scrollText = document.querySelector("#scrollText");

  if (!inputNumber || !btn || !resultMessage || !scrollText) return;

  btn.addEventListener("click", function () {
    const input = inputNumber.value.trim();

    if (!/^(?:[1-9]|[1-9]\d|100)$/.test(input)) {
      alert("1～100の半角整数で入力してください");
      return;
    }

    const guess = Number(input);

    if (typeof window.postCount === "undefined") {
      window.postCount = 1;
    }

    if (guess === answerNumber) {
      resultMessage.textContent = "正解！次の数字をセットしました";
      resultMessage.style.color = "blue";

      // 今日の日付と時刻
      const now = new Date();
      const dateStr = now.toLocaleDateString("ja-JP") + " " + now.toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' });

      // 上書きされる前に、現在の正解の数字を別の変数（currentCorrectAnswer）にコピーして避難させる
      const currentCorrectAnswer = answerNumber;

      // ここで先に、次の新しい問題をセット
      answerNumber = Math.floor(Math.random() * 100) + 1;

      // PHPへデータを送る処理（避難させたcurrentCorrectAnswerを使う）
      fetch('save_log.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        // コピーした数字を送る
        body: JSON.stringify({ type: 'game', value: currentCorrectAnswer })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('ログ保存失敗: ${response.status}');
          }
          return response.text();
        })
        .then(data => {
          console.log('PHPからの返事:', data);

          // 掲示板の1つの書き込みを新しく錬成（ここも避難させた数字を使う）
          const newPost = document.createElement("div");
          newPost.className = "bbs_post";

          // コピーした数字を表示
          newPost.innerHTML = `<span class='bbs_icon'>🎯</span> <span class='bbs_name'>名無しさん＠正解者</span> : ${dateStr} <br> 【NUM_GUESS】見事に正解の数字「${currentCorrectAnswer}」を的中させました！`;

          const bbsList = document.querySelector("#bbsList");
          bbsList.prepend(newPost);
        })
        .catch(error => console.error('エラーが発生しました:', error));

    } else if (guess > answerNumber) {
      resultMessage.style.color = "black";
      resultMessage.textContent = "↓↓ もっと小さい数字だよ ↓↓";
    } else {
      resultMessage.style.color = "black";
      resultMessage.textContent = "↑↑ もっと大きい数字だよ ↑↑";
    }

    inputNumber.value = "";
    inputNumber.focus();
  });

  // Enterキーでも確認ボタンを発火
  inputNumber.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.isComposing) {
      e.preventDefault();
      btn.click();
    }
  });

  // ウィンドウ下部の横スクロール文字
  scrollText.textContent = "　".repeat(30) + scrollText.textContent;

  function marqueeEffect() {
    let text = scrollText.textContent;

    // 先頭の1文字（0番目）と、それ以降の文字(1番目～最後)に分解して、前後を入れ替える
    // .slice(1)は「1文字目から最後まで切り出す」という意味
    // .charAt(0)は「0番目（先頭）の文字を捕まえる」という意味
    scrollText.textContent = text.slice(1) + text.charAt(0);
  }

  // 200ミリ秒(0.2秒)ごとにmarqueeEffectを実行する
  setInterval(marqueeEffect, 200);

  // 隠しコマンド
  inputNumber.addEventListener("keydown", function (e) {
    inputHistory.push(e.key.toLowerCase());

    if (inputHistory.length > secretCommand.length) {
      inputHistory.shift();
    }

    const currentInput = inputHistory.join("");

    if (currentInput === secretCommand) {
      scrollText.textContent = "　".repeat(30) + `【チートモード発動中】現在の正解は[${answerNumber}]です！`;
      alert("裏コマンド「CHEAT」が発動しました！");
      inputHistory = [];
    }
  });
}