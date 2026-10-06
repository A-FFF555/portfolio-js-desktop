/**
 * ペイント
 * paintApp.js
 */

import { element } from "./domUtils.js";

export function initPaintApp() {
  const canvas = document.querySelector("#paintCanvas");
  if (!canvas) return;

  const paintBody = canvas.closest(".paint_body");
  if (!paintBody) return;

  const paintContainer = canvas.closest(".paint_container");
  if (!paintContainer) return;

  const ctx = canvas.getContext("2d");
  let isDrawingPaint = false;
  let currentColor = "#000000";

  // ペンの基本設定
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  /**
   * 解像度と表示サイズを安全に同期する
   */
  function syncCanvasResolution() {
    // CSS側で計算された paint_body の内寸から、パディング分（計8px）を引く
    const displayWidth = paintBody.clientWidth - 8;
    const displayHeight = paintBody.clientHeight - 8;

    if (displayWidth <= 0 || displayHeight <= 0) return;

    // 解像度に変更があったときだけリサイズ処理を行う
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");

      if (tempCtx && canvas.width > 0 && canvas.height > 0) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      if (tempCanvas.width > 0 && tempCanvas.height > 0) {
        ctx.drawImage(tempCanvas, 0, 0); // 等倍で絵を復元
      }

      // 解像度変更でリセットされる設定を再適用
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.strokeStyle = currentColor;
    }
  }

  // 初回同期実行
  syncCanvasResolution();

  // --- お絵描きロジック ---

  // 描画している一本の指・マウスだけを追跡する
  let activePointerId = null;
  let wasInsideCanvas = false;

  function getPointerPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;

    return {
      inside:
        cssX >= 0 && cssX <= rect.width &&
        cssY >= 0 && cssY <= rect.height,
      // CSS上の座標をキャンバス内部の座標に合わせる
      x: cssX * canvas.width / rect.width,
      y: cssY * canvas.height / rect.height
    };
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (activePointerId !== null) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    syncCanvasResolution();

    activePointerId = e.pointerId;
    wasInsideCanvas = true;
    canvas.setPointerCapture(e.pointerId);

    const { x, y } = getPointerPosition(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerId !== activePointerId) return;

    const { inside, x, y } = getPointerPosition(e);

    if (!inside) {
      // 枠外へ出た時点で、次の点とはつながない
      wasInsideCanvas = false;
      return;
    }

    if (!wasInsideCanvas) {
      // 枠内に戻った最初の点から、新しい線を始める
      ctx.beginPath();
      ctx.moveTo(x, y);
      wasInsideCanvas = true;
      return;
    }

    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.stroke();
  });

  function stopDrawing(e) {
    if (e.pointerId !== activePointerId) return;

    activePointerId = null;
    wasInsideCanvas = false;
    ctx.beginPath();

    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  }

  canvas.addEventListener("pointerup", stopDrawing); canvas.addEventListener("pointercancel", stopDrawing); canvas.addEventListener("lostpointercapture", stopDrawing);


  // 色変更
  const colorButtons = document.querySelectorAll(".tool_btn");
  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const activeBtn = document.querySelector(".tool_btn.active");
      if (activeBtn) {
        activeBtn.classList.remove("active");
        activeBtn.setAttribute("aria-pressed", "false");
      }

      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      currentColor = button.style.backgroundColor;
    });
  });

  // モーダル・全消去システム
  const btnClearCanvas = document.querySelector("#btnClearCanvas");
  const paintModal = document.querySelector("#paintModal");
  const btnModalOK = document.querySelector("#btnModalOK");
  const btnModalCancel = document.querySelector("#btnModalCancel");

  if (btnClearCanvas && paintModal && btnModalOK && btnModalCancel) {
    btnClearCanvas.addEventListener("click", () => {
      paintModal.style.display = "block";
    });

    btnModalOK.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      paintModal.style.display = "none";
    });

    btnModalCancel.addEventListener("click", () => {
      paintModal.style.display = "none";
    });
  }

  // ウィンドウシステムとの連動用イベント
  if (paintContainer) {
    // windowSystem.js側のリサイズ通知を受けて同期する
    window.addEventListener("resize", () => {
      if (paintContainer.style.display !== "none") {
        syncCanvasResolution();
      }
    });

    // 起動時の表示ズレ防止に少し遅れて初期同期
    setTimeout(syncCanvasResolution, 100);
  }
}