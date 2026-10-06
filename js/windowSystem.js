/**
 * デスクトップ操作
 * windowsSystem.js
 */

import { apps } from "./apps.js";

// 画面端の防壁ガード用定数
const SCREEN_MARGIN_X = 50;
const TASKBAR_HEIGHT = 32;
const SCREEN_MARGIN_Y = TASKBAR_HEIGHT + 30;

/**
 * 状態（表示/非表示・タスクバーの凹凸）を一括で切り替える
 */
export function toggleWindow(app, forceState) {
  if (!app.container) return;

  const isHidden = app.container.style.display === "none";

  const shouldShow =
    forceState !== undefined
      ? forceState
      : isHidden;

  if (shouldShow) {
    app.container.style.setProperty(
      "display",
      "flex",
      "important"
    );

    app.taskBtn?.classList.add("win_active");
  } else {
    app.container.style.setProperty(
      "display",
      "none",
      "important"
    );

    app.taskBtn?.classList.remove("win_active");
  }
}


/* ====================
   ウィンドウ状態管理
==================== */

function bringToFront(targetApp) {
  const ordered = apps
    .filter(app => app.container)
    .sort((a, b) => {
      const aZ = Number(getComputedStyle(a.container).zIndex) || 0;
      const bZ = Number(getComputedStyle(b.container).zIndex) || 0;
      return aZ - bZ;
    });

  const index = ordered.indexOf(targetApp);
  if (index === -1) return;

  ordered.splice(index, 1);
  ordered.push(targetApp);

  ordered.forEach((app, i) => {
    app.container.style.zIndex = String(20 + i);
  })
  saveDesktopStateToLocal();
}

/**
 * 最大化する直前の位置・サイズを保存
 */
function captureRestoreBounds(app) {
  if (!app.container) return;

  const rect = app.container.getBoundingClientRect();

  app.restoreBounds = {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  };
}

/**
 * 最大化前の位置・サイズへ戻す
 */
function restoreNormalBounds(app) {
  if (!app.container) return;

  const bounds = app.restoreBounds;

  // 保存データがある場合
  if (bounds) {
    app.container.style.left = `${bounds.left}px`;
    app.container.style.top = `${bounds.top}px`;
    app.container.style.width = `${bounds.width}px`;
    app.container.style.height = `${bounds.height}px`;

    // translate中央配置などを解除
    app.container.style.transform = "none";
    app.isTransformCleared = true;
  } else {
    // 古い保存データなどへの保険
    app.container.style.width = "";
    app.container.style.height = "";
  }
}

/**
 * ボタン・リサイズハンドル表示を現在の状態に合わせる
 */
function updateWindowControls(app) {
  if (!app.container) return;

  const isMaximized =
    app.container.classList.contains("is_maximized");

  const isMinimized =
    app.container.classList.contains("is_minimized");

  const maxBtn =
    app.container.querySelector(".win_max_btn");

  const resizeHandle =
    app.container.querySelector(".win_resize_handle");

  if (maxBtn) {
    maxBtn.textContent =
      isMaximized ? "🗗" : "□";
  }

  if (resizeHandle) {
    resizeHandle.style.display =
      isMaximized || isMinimized
        ? "none"
        : "";
  }
}

/**
 * 最大化 / 最大化解除
 */
function toggleMaximizedState(app) {
  if (!app.container) return;

  const container = app.container;

  const isMinimized =
    container.classList.contains("is_minimized");

  const isMaximized =
    container.classList.contains("is_maximized");

  /**
   * 最小化中の場合
   */
  if (isMinimized) {
    container.classList.remove("is_minimized");

    /**
     * 「最大化 → 最小化」だった場合は
     * 最大化状態へ戻す
     */
    if (app.wasMaximizedBeforeMinimize) {
      container.classList.add("is_maximized");

      app.wasMaximizedBeforeMinimize = false;

      updateWindowControls(app);
      notifyWindowLayoutChanged();

      return;
    }

    app.wasMaximizedBeforeMinimize = false;
  }


  /**
   * 最大化中 → 通常へ戻す
   */
  if (isMaximized) {
    container.classList.remove("is_maximized");

    restoreNormalBounds(app);

    updateWindowControls(app);
    notifyWindowLayoutChanged();

    return;
  }

  /**
   * 通常 → 最大化
   */

  // 最大化直前の位置・サイズを保存
  captureRestoreBounds(app);

  container.classList.remove("is_minimized");
  container.classList.add("is_maximized");

  app.wasMaximizedBeforeMinimize = false;

  updateWindowControls(app);
  notifyWindowLayoutChanged();
}


/**
 * 最小化 / 最小化解除
 */
function toggleMinimizedState(app) {
  if (!app.container) return;

  const container = app.container;
  const isMinimized = container.classList.contains("is_minimized");
  const isMaximized = container.classList.contains("is_maximized");

  /**
   * 最小化中 → 復帰
   */
  if (isMinimized) {
    container.classList.remove("is_minimized");

    // 最大化状態から最小化された場合
    if (app.wasMaximizedBeforeMinimize) {
      container.classList.add("is_maximized");
    }

    app.wasMaximizedBeforeMinimize = false;

    updateWindowControls(app);
    notifyWindowLayoutChanged();

    return;
  }

  /**
   * 通常 / 最大化 → 最小化
   */

  // 最大化されていたか覚えておく
  app.wasMaximizedBeforeMinimize = isMaximized;

  // 最大化と最小化を同時につけない
  container.classList.remove("is_maximized");
  container.classList.add("is_minimized");

  updateWindowControls(app);
  notifyWindowLayoutChanged();
}

/**
 * スマホでは強制的に最大化
 */
function setMobileMaximized(app) {
  if (!app.container) return;

  app.container.classList.remove("is_minimized");
  app.container.classList.add("is_maximized");

  app.wasMaximizedBeforeMinimize = false;

  updateWindowControls(app);
}


/**
 * レイアウト変更後の共通処理
 */
function notifyWindowLayoutChanged() {
  // canvasなどにサイズ変更を通知
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
  }, 50);

  saveDesktopStateToLocal();
}


/* ==============
   サーバー保存
============== */

/**
 * 全ウィンドウの状態を保存
 */
export function saveDesktopStateToLocal() {
  const state = apps.map(app => {
    let isOpen = false;

    if (app.container) {
      isOpen =
        app.container.style.display !== "none" &&
        getComputedStyle(app.container).display !== "none";
    }

    const isMaximized = app.container?.classList.contains("is_maximized") || false;

    const isMinimized = app.container?.classList.contains("is_minimized") || false;

    /**
     * 最大化中は、見た目上のサイズではなく
     * 最大化直前のサイズを保存する
     */
    const useRestoreBounds = app.restoreBounds && (isMaximized || (isMinimized && app.wasMaximizedBeforeMinimize));

    return {
      id: app.id,
      isOpen,
      top: useRestoreBounds
        ? `${app.restoreBounds.top}px`
        : app.container?.style.top || "",
      left: useRestoreBounds
        ? `${app.restoreBounds.left}px`
        : app.container?.style.left || "",
      width: useRestoreBounds
        ? `${app.restoreBounds.width}px`
        : app.container?.style.width || "",
      height: useRestoreBounds
        ? `${app.restoreBounds.height}px`
        : app.container?.style.height || "",

      isMaximized,
      isMinimized,

      /**
       * 最大化前のサイズもそのまま保存
       */
      restoreBounds:
        app.restoreBounds || null,
      wasMaximizedBeforeMinimize:
        app.wasMaximizedBeforeMinimize || false,
      zIndex:
        app.container?.style.zIndex || ""
    };
  });

  localStorage.setItem("retroDesktopState", JSON.stringify(state));
}


/* ====================
   ドラッグ・リサイズ
==================== */

let activeDragApp = null;
let activeResizeApp = null;

/**
 * マウス移動
 */
document.addEventListener("mousemove", (e) => {

  /**
   * ウィンドウ移動
   */

  if (activeDragApp) {
    const app = activeDragApp;

    if (app.container.classList.contains("is_maximized")) {
      return;
    }

    if (!app.isTransformCleared) {
      const rect = app.container.getBoundingClientRect();

      app.container.style.left = rect.left + "px";
      app.container.style.top = rect.top + "px";
      app.container.style.transform = "none";
      app.isTransformCleared = true;
    }

    let newLeft = app.container.offsetLeft + e.movementX;
    let newTop = app.container.offsetTop + e.movementY;

    const windowWidth = app.container.offsetWidth || 350;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;


    if (newTop < 0) {
      newTop = 0;
    }

    if (newLeft < -(windowWidth - SCREEN_MARGIN_X)
    ) {
      newLeft = -(windowWidth - SCREEN_MARGIN_X);
    }

    if (newLeft > screenWidth - SCREEN_MARGIN_X) {
      newLeft = screenWidth - SCREEN_MARGIN_X;
    }

    if (newTop > screenHeight - SCREEN_MARGIN_Y) {
      newTop = screenHeight - SCREEN_MARGIN_Y;
    }

    app.container.style.left = `${newLeft}px`;
    app.container.style.top = `${newTop}px`;
  }


  /**
   * リサイズ
   */

  if (activeResizeApp) {
    const app = activeResizeApp;

    if (app.container.classList.contains("is_maximized")) {
      return;
    }

    const diffX = e.clientX - app.startX;
    const diffY = e.clientY - app.startY;

    const newWidth = Math.max(250, app.startWidth + diffX);
    const newHeight = Math.max(150, app.startHeight + diffY);

    app.container.style.width = `${newWidth}px`;
    app.container.style.height = `${newHeight}px`;
  }
});


/**
 * 操作終了
 */
document.addEventListener("mouseup", () => {
  if (activeDragApp || activeResizeApp) {
    activeDragApp = null;
    activeResizeApp = null;

    saveDesktopStateToLocal();
  }
});


/* =========
   初期化
========= */

export function initWindowEngine() {

  const startBtn = document.querySelector(".start_btn");
  const footerNode = document.querySelector("footer");


  /* =============================
     タスクバー・スタートメニュー
  ============================= */

  if (startBtn && footerNode) {

    /* スタートボタン */
    startBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = footerNode.classList.toggle("menu_open");

      /**
       * スマホ
       */
      if (window.innerWidth <= 1023 && isOpen) {
        const taskButtons = footerNode.querySelectorAll(".task_btn");
        let currentBottom = 55;
        const gap = 39;

        taskButtons.forEach(btn => {

          if (btn.style.display !== "none" && getComputedStyle(btn).display !== "none") {
            btn.style.setProperty("bottom", `${currentBottom}px`, "important");

            currentBottom += gap;
          }
        });
      }
    }
    );


    /* デスクトップクリック */
    document.addEventListener("click", () => {
      footerNode.classList.remove("menu_open");
    }
    );

    /* スタートメニュー */
    const menuItems = footerNode.querySelectorAll(".menu_item");

    menuItems.forEach(item => {

      item.addEventListener("click", (e) => {
        e.stopPropagation();

        const appId = item.getAttribute("data-app-id");
        const targetApp = apps.find(app => app.id === appId);

        if (targetApp) {

          if (window.innerWidth <= 1023) {
            apps.forEach(otherApp => {

              if (otherApp.id !== targetApp.id) {
                toggleWindow(otherApp, false);
              }
            });

            setMobileMaximized(targetApp);
          }

          toggleWindow(targetApp, true);
          bringToFront(targetApp);

          saveDesktopStateToLocal();
        }

        footerNode.classList.remove("menu_open");
      }
      );
    });
  }


  /* ==============
     各ウィンドウ
  ============== */

  apps.forEach(app => {

    if (!app.container) return;

    app.container.addEventListener("pointerdown", () => {
      bringToFront(app);
    });

    /**
     * 初期状態
     */
    if (!app.container.style.display) {
      app.container.style.display = "none";
    }

    app.restoreBounds = app.restoreBounds || null;
    app.wasMaximizedBeforeMinimize = false;

    /**
     * デスクトップアイコン
     */

    app.icon?.addEventListener("click", () => {

      if (window.innerWidth <= 1023) {

        apps.forEach(otherApp => {

          if (otherApp.id !== app.id) {
            toggleWindow(otherApp, false);
          }
        });

        setMobileMaximized(app);
      }

      toggleWindow(app, true);
      bringToFront(app);

      saveDesktopStateToLocal();
    }
    );


    /**
     * タスクバーボタン
     */

    if (app.taskBtn) {

      app.taskBtn.addEventListener("click", () => {

        const isHidden = app.container.style.display === "none";

        if (window.innerWidth <= 1023 && isHidden) {

          apps.forEach(otherApp => {

            if (otherApp.id !== app.id) {
              toggleWindow(otherApp, false);
            }
          });

          setMobileMaximized(app);
        }

        toggleWindow(app);
        if (isHidden) {
          bringToFront(app);
        }

        footerNode?.classList.remove("menu_open");

        saveDesktopStateToLocal();
      }
      );

      /**
       * ダブルクリック
       * → 通常サイズへ戻して中央配置
       */
      app.taskBtn.addEventListener("dblclick", () => {

        toggleWindow(app, true);

        app.container.classList.remove("is_maximized", "is_minimized");
        app.wasMaximizedBeforeMinimize = false;
        app.restoreBounds = null;

        app.container.style.left = "50%";
        app.container.style.top = "40%";
        app.container.style.width = "";
        app.container.style.height = "";
        app.container.style.transform = "translate(-50%, -50%)";

        app.isTransformCleared = false;

        updateWindowControls(app);

        saveDesktopStateToLocal();
      }
      );
    }


    /**
     * タイトルバー
     */

    const titleBar = app.container.querySelector(".win_title_bar");

    if (!titleBar) return;

    app.isTransformCleared = false;

    /**
     * ウィンドウ移動開始
     */
    titleBar.addEventListener("mousedown", () => {
      activeDragApp = app;
    }
    );

    /**
     * リサイズ
     */

    const resizeHandle = app.container.querySelector(".win_resize_handle");

    resizeHandle?.addEventListener("mousedown", (e) => {

      if (app.container.classList.contains("is_maximized")) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      activeResizeApp = app;

      app.startWidth = app.container.offsetWidth;
      app.startHeight = app.container.offsetHeight;
      app.startX = e.clientX;
      app.startY = e.clientY;
    }
    );


    /**
     * 最大化
     */

    const maxBtn = titleBar.querySelector(".win_max_btn");

    maxBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMaximizedState(app);
    }
    );

    /**
     * 閉じる
     */

    const closeBtn = titleBar.querySelector("button[id$='Close'], button.win_close_btn");

    closeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWindow(app, false);
      saveDesktopStateToLocal();
    }
    );

    /**
     * 最小化
     */

    const minimizeBtn = titleBar.querySelector("button[id$='Minimize']");

    minimizeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMinimizedState(app);
    }
    );
  });
}

/* =======================
   起動時の状態復元
======================= */

export function loadDesktopStateFromLocal() {
  try {
    const saved = localStorage.getItem("retroDesktopState");
    const data = saved === null ? [] : JSON.parse(saved);

    if (!Array.isArray(data)) {
      throw new Error("保存されたデータが配列ではありません。");
    }

    if (data.length === 0) {
      apps.forEach(app => toggleWindow(app, false));
      return;
    }

    data.forEach(savedApp => {

      const app = apps.find(app => app.id === savedApp.id);

      if (!app || !app.container) {
        return;
      }

      /**
       * 通常サイズ
       */
      if (savedApp.top) {
        app.container.style.top = savedApp.top;
      }

      if (savedApp.left) {
        app.container.style.left = savedApp.left;
      }

      if (savedApp.width) {
        app.container.style.width = savedApp.width;
      }

      if (savedApp.height) {
        app.container.style.height = savedApp.height;
      }

      if (savedApp.zIndex) {
        app.container.style.zIndex = savedApp.zIndex;
      }

      if (savedApp.top || savedApp.left) {
        app.container.style.transform = "none";
        app.isTransformCleared = true;
      }

      /**
       * 最大化前サイズを復元
       */
      if (savedApp.restoreBounds) {
        app.restoreBounds = {
          left: savedApp.restoreBounds.left,
          top: savedApp.restoreBounds.top,
          width: savedApp.restoreBounds.width,
          height: savedApp.restoreBounds.height
        };
      }

      app.wasMaximizedBeforeMinimize = savedApp.wasMaximizedBeforeMinimize || false;

      /**
       * 一旦状態を全部解除
       */
      app.container.classList.remove("is_maximized", "is_minimized");

      /**
       *  スマホ
       */
      if (window.innerWidth <= 1023) {
        if (savedApp.isOpen) {
          setMobileMaximized(app);
        }
      }

      /**
       *  PC
       */
      else {

        /**
         * 最小化優先
         */
        if (savedApp.isMinimized) {
          app.container.classList.add("is_minimized");

          /**
           * 古い保存データで
           * max + min が両方trueだった場合への保険
           */
          if (savedApp.isMaximized && !savedApp.wasMaximizedBeforeMinimize) {
            app.wasMaximizedBeforeMinimize = true;
          }
        }

        /**
         * 最大化
         */
        else if (savedApp.isMaximized) {
          app.container.classList.add("is_maximized");
        }
        updateWindowControls(app);
      }

      toggleWindow(app, savedApp.isOpen);
    });

  } catch (error) {
    console.error("デスクトップ復元エラー:", error);
  }
}


/* =======================
   画面サイズ変更時の防壁
======================= */

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    return;
  }

  apps.forEach(app => {

    if (!app.container || app.container.style.display === "none") {
      return;
    }

    if (app.container.classList.contains("is_maximized")) {
      return;
    }

    const rect = app.container.getBoundingClientRect();

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const taskbarHeight = 30;

    let newLeft = rect.left;
    let newTop = rect.top;

    if (rect.left > screenWidth - 50) {
      newLeft = Math.max(0, screenWidth - rect.width);
    }

    if (rect.top > screenHeight - (taskbarHeight + 30)) {
      newTop = Math.max(0, screenHeight - rect.height - taskbarHeight);
    }

    app.container.style.left = `${newLeft}px`;
    app.container.style.top = `${newTop}px`;
  });
}
);