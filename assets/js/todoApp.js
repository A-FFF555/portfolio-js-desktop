// ================
// Todoリスト（完全整理・削除機能付き版）
// ================

import { element, render } from "./domUtils.js";

const todoInput = document.querySelector("#todoInput");
const btnTodoAdd = document.querySelector("#btnTodoAdd");
const todoListContainer = document.querySelector("#todoListContainer");

let todoItems = [];

/**
 * 現在のリスト状態をサーバーに保存
 */
const TODO_STORAGE_KEY = "retroTodoItems";

const saveTodo = () => {
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todoItems));
};

const loadTodo = () => {
  try {
    const saved = localStorage.getItem(TODO_STORAGE_KEY);

    // nullは「まだ保存したことがない」状態
    // []は「全部削除した」状態
    todoItems = saved === null
      ? [
        { id: 1, text: "数当てゲームで遊ぶ", completed: false },
        { id: 2, text: "BBSに書き込む", completed: true }
      ]
      : JSON.parse(saved);

    if (!Array.isArray(todoItems)) {
      throw new Error("保存データが配列ではありません。");
    }
  } catch (error) {
    console.error("Todoの読み込みエラー:", error);
    todoItems = [];
  }

  updateTodoListView();
};

/**
 * 画面の再描画（ビューの更新）
 */
const updateTodoListView = () => {
  // 1. 外枠の <ul> を安全に生成
  const uListElement = element`
    <ul id="todoList" style="list-style: none; padding: 5px; margin: 0;"></ul>
  `;

  // 2. データをループして <li> を生成（削除ボタンを追加）
  todoItems.forEach(item => {
    const completedClass = item.completed ? "todo_item completed" : "todo_item";
    const isChecked = item.completed ? "checked" : "";

    // デザインが崩れないよう、削除ボタン（todo_delete_btn）を配置
    const liElement = element`
      <li class="${completedClass}" data-id="${item.id}" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <input type="checkbox" ${isChecked}>
          <span>${item.text}</span>
        </div>
        <button class="todo_delete_btn" style="cursor: pointer; background: none; border: none; padding: 0 4px; color: #888;">×</button>
      </li>
    `;

    uListElement.appendChild(liElement);
  });

  // 3. 画面のクボミを入れ替え
  render(uListElement, todoListContainer);
};

/**
 * アプリケーションの初期化
 */
export function initTodoApp() {
  if (!todoInput || !btnTodoAdd || !todoListContainer) return;

  // --- タスク追加処理 ---
  btnTodoAdd.addEventListener("click", () => {
    const text = todoInput.value.trim();
    if (text === "") return;

    todoItems.push({
      id: Date.now(),
      text: text,
      completed: false
    });

    todoInput.value = "";
    updateTodoListView();
    saveTodo();
  });

  todoInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.isComposing) {
      e.preventDefault();
      btnTodoAdd.click();
    }
  });

  // --- チェックボックスの完了状態の同期 ---
  todoListContainer.addEventListener("change", (e) => {
    if (e.target.tagName !== "INPUT" || e.target.type !== "checkbox") return;

    const liElement = e.target.closest("li");
    const todoId = Number(liElement.dataset.id);
    const targetItem = todoItems.find(item => item.id === todoId);

    if (targetItem) {
      targetItem.completed = e.target.checked;
      updateTodoListView();
      saveTodo();
    }
  });

  // --- タスクの完全削除処理 ---
  // 白いクボミ（todoListContainer）のクリックイベントを監視して削除ボタンを判定
  todoListContainer.addEventListener("click", (e) => {
    // クリックされたのが削除ボタン（todo_delete_btn）でなければ何もしない
    if (!e.target.classList.contains("todo_delete_btn")) return;

    const liElement = e.target.closest("li");
    const todoId = Number(liElement.dataset.id);

    // 配列（todoItems）から、クリックされたID「以外」を抽出して上書き（これで完全抹殺）
    todoItems = todoItems.filter(item => item.id !== todoId);

    // 画面の更新とサーバーへの同期
    updateTodoListView();
    saveTodo();
  });

  // サーバーからデータを読み込んで開始
  loadTodo();
}