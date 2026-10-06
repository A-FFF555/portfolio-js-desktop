/**
 *お天気アプリ
 */

export function initWeatherApp() {
  const citySelect = document.querySelector("#citySelect");
  const dateText = document.querySelector("#dateText");

  if (!citySelect || !dateText) return;

  // 各地域（札幌・東京・沖縄）の 緯度・経度 データベース
  const cityDatabase = {
    sapporo: { name: "札幌", lat: 43.0667, lon: 141.3500 },
    tokyo: { name: "東京", lat: 35.6895, lon: 139.6917 },
    okinawa: { name: "那覇", lat: 26.2124, lon: 127.6809 }
  };

  // お天気データを通信（fetch）して画面を書き換える
  function fetchWeather(cityKey) {
    // 選択された地域のデータをデータベースから取得
    const cityData = cityDatabase[cityKey];

    // 選択された緯度(lat)・経度(lon)をURLに埋め込む
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${cityData.lat}&longitude=${cityData.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FTokyo`;

    // 画面を一時的に「通信中...」にする
    const cityNameEl = document.querySelector("#cityName");
    if (cityNameEl) cityNameEl.textContent = "通信中...";

    // fetch
    fetch(url)
      .then(response => response.json())
      .then(data => {
        updateWeatherCard(data, cityData.name);
      })
      .catch(error => {
        console.error("エラー:", error);
        if (cityNameEl) cityNameEl.textContent = "通信エラー";
      });
  }

  function updateWeatherCard(data, cityName) {
    const current = data.current;

    const cityNameEl = document.querySelector("#cityName");
    const tempEl = document.querySelector("#temperature");
    const humidEl = document.querySelector("#humidity");
    const windEl = document.querySelector("#windSpeed");

    if (cityNameEl) cityNameEl.textContent = cityName;
    if (tempEl) tempEl.textContent = Math.round(current.temperature_2m);
    if (humidEl) humidEl.textContent = current.relative_humidity_2m + " %";
    if (windEl) windEl.textContent = current.wind_speed_10m + " m/s";

    // データの中の時間（time）を分析して昼夜を判定する
    // data.current.time には "2026-07-01T14:00" のような形式で文字列が届くので、時間を切り抜く
    const dataTimeStr = current.time; // 例: "2026-07-01T14:00"
    const hour = parseInt(dataTimeStr.split("T")[1].split(":")[0]); // ➔ 14 という数値が取れる

    const bodyElement = document.body;
    bodyElement.classList.remove("rainy", "night");

    // もしデータ時刻が「朝6時より前」または「夜18時以降」なら夜モードにする
    if (hour < 6 || hour >= 18) {
      bodyElement.classList.add("night");
    }

    // 天気コードで絵文字とテキストを切り替え
    const code = current.weather_code;
    const iconElement = document.querySelector("#weatherIcon");
    const descElement = document.querySelector("#weatherDesc");

    if (!iconElement || !descElement) return;

    if (code === 0 || code === 1) {
      iconElement.textContent = "☀️";
      descElement.textContent = "快晴・晴れ";
    } else if (code === 2 || code === 3) {
      iconElement.textContent = "☁️";
      descElement.textContent = "くもり";
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      iconElement.textContent = "☔";
      descElement.textContent = "雨が降っています";
      // 夜モードじゃなければ、雨用のどんよりグレー背景を適用
      if (hour >= 6 && hour < 18) {
        bodyElement.classList.add("rainy");
      }
    } else {
      iconElement.textContent = "💨";
      descElement.textContent = "その他（霧など）";
    }
  }

  // ページが開いた瞬間は、一番最初の「札幌（sapporo）」の天気を取得しに行く
  const today = new Date();
  dateText.textContent = today.toLocaleDateString("ja-JP");

  fetchWeather("sapporo");

  // セレクトボックスが切り替わった（change）瞬間に再発火
  citySelect.addEventListener("change", function (event) {
    // ユーザーが選んだ値（"tokyo" や "okinawa"）を引数にして、fetch関数を再実行
    fetchWeather(event.target.value);
  });
}