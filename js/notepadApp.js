/**
 * メモ帳
 */

export function initNotepadApp() {
  const memoTextArea = document.querySelector("#memoTextArea");

  if (!memoTextArea) return;

  const savedMemo = localStorage.getItem("savedMemoData");
  if (savedMemo !== null) {
    memoTextArea.value = savedMemo;
  }

  memoTextArea.addEventListener("input", function () {
    const currentText = memoTextArea.value;
    localStorage.setItem("savedMemoData", currentText);
  });
}