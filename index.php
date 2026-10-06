<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>JS練習ページ</title>
  <link rel="stylesheet" href="./css/main.css">
</head>

<body id="retro_os_body">
  <div id="desktop">

    <div class="desktop_icon" id="iconGame">
      <div class="icon_picture">🎯</div>
      <div class="icon_label">NUM_GUESS.EXE</div>
    </div>

    <div class="desktop_icon" id="iconNote">
      <div class="icon_picture">📄</div>
      <div class="icon_label">NOTEPAD.EXE</div>
    </div>

    <div class="desktop_icon" id="iconPaint">
      <div class="icon_picture">🎨</div>
      <div class="icon_label">PAINT.EXE</div>
    </div>

    <div class="desktop_icon" id="iconCalc">
      <div class="icon_picture">🧮</div>
      <div class="icon_label">CALC.EXE</div>
    </div>

    <div class="desktop_icon" id="iconBbs">
      <div class="icon_picture">💬</div>
      <div class="icon_label">BBS.EXE</div>
    </div>

    <div class="desktop_icon" id="iconWeather">
      <div class="icon_picture">🌤️</div>
      <div class="icon_label">WEATHER.EXE</div>
    </div>

    <div class="desktop_icon" id="iconTodo">
      <div class="icon_picture">📅</div>
      <div class="icon_label">TODO.EXE</div>
    </div>
  </div>


  <!-- 数当てゲーム -->
  <div class="game_container win_window">

    <div class="win_title_bar" id="gameTitleBar">
      <span>🎯 NUM_GUESS.EXE</span>
      <div class="win_btn_box">
        <button id="btnGamaMinimize">_</button>
        <button class="win_max_btn">□</button>
        <button id="btnGameClose">×</button>
      </div>
    </div>

    <div class="win_body game_body">
      <p id="resultMessage">1～100の数字を入力してね！</p>
      <div class="win_input_group">
        <input type="text" id="inputNumber">
        <button id="btn">確認</button>
      </div>
    </div>

    <div class="status_bar">
      <span id="scrollText">★★数字を当ててみてね！★★</span>
    </div>
  </div>


  <!-- メモ帳 -->
  <div class="notepad_container win_window">

    <div class="win_title_bar" id="notepadTitleBar">
      <span>📄 NOTEPAD.EXE</span>
      <div class="win_btn_box">
        <button id="btnNoteMinimize">_</button>
        <button class="win_max_btn">□</button>
        <button id="btnNoteClose">×</button>
      </div>
    </div>

    <div class="win_body notepad_body">
      <div class="win_inset_panel">
        <textarea id="memoTextArea" placeholder="ここにメモを入力してね..."></textarea>
      </div>
      <div class="status_bar">状態：自動保存中...</div>
    </div>
    <div class="win_resize_handle"></div>
  </div>


  <!-- ペイント -->
  <div class="paint_container win_window">

    <div class="win_title_bar" id="paintTitleBar">
      <span>🎨 PAINT.EXE</span>
      <div class="win_btn_box">
        <button id="btnPaintMinimize">_</button>
        <button class="win_max_btn">□</button>
        <button id="btnPaintClose">×</button>
      </div>
    </div>

    <div class="paint_toolbar">
      <button
        id="btnColorBlack"
        class="tool_btn active"
        style="background-color: #000000;"
        aria-label="黒のペン"
        aria-pressed="true"></button>
      <button
        id="btnColorRed"
        class="tool_btn"
        style="background-color: #ff0000;"
        aria-label="赤のペン"
        aria-pressed="false"></button>
      <button
        id="btnColorBlue"
        class="tool_btn"
        style="background-color: #0000ff;"
        aria-label="青のペン"
        aria-pressed="false"></button>
      <button
        id="btnColorGreen"
        class="tool_btn"
        style="background-color: #008000;"
        aria-label="緑のペン"
        aria-pressed="false"></button>
      <div class="tool_divider"></div>
      <button id="btnClearCanvas">全消去</button>
    </div>

    <div class="win_body paint_body">
      <canvas id="paintCanvas" class="win_inset_panel"></canvas>
    </div>

    <div class="win_resize_handle"></div>
  </div>

  <div id="paintModal" class="win_modal" style="display: none;">
    <div class="modal_title_bar">⚠️ 警告</div>
    <div class="modal_body">
      <p>キャンバスを完全に消去して<br>よろしいですか？</p>
      <div class="modal_buttons">
        <button id="btnModalOK">OK</button>
        <button id="btnModalCancel">キャンセル</button>
      </div>
    </div>
  </div>


  <!-- 計算機 -->
  <div class="calc_container win_window">

    <div class="win_title_bar" id="calcTitleBar">
      <span>🧮 CALC.EXE</span>
      <div class="win_btn_box">
        <button id="btnCalcMinimize">_</button>
        <button class="win_max_btn">□</button>
        <button id="btnCalcClose">×</button>
      </div>
    </div>

    <div class="win_body calc_body">
      <input type="text" id="calcDisplay" class="win_inset_panel" value="0" readonly>

      <div class="calc_buttons">
        <button class="calc_btn num_btn">7</button>
        <button class="calc_btn num_btn">8</button>
        <button class="calc_btn num_btn">9</button>
        <button class="calc_btn op_btn">÷</button>

        <button class="calc_btn num_btn">4</button>
        <button class="calc_btn num_btn">5</button>
        <button class="calc_btn num_btn">6</button>
        <button class="calc_btn op_btn">×</button>

        <button class="calc_btn num_btn">1</button>
        <button class="calc_btn num_btn">2</button>
        <button class="calc_btn num_btn">3</button>
        <button class="calc_btn op_btn">－</button>

        <button class="calc_btn num_btn">0</button>
        <button class="calc_btn" id="btnCalcClear">C</button>
        <button class="calc_btn" id="btnCalcEqual">＝</button>
        <button class="calc_btn op_btn">＋</button>
      </div>
    </div>
  </div>


  <!-- 天気 -->
  <div class="weather_container win_window">

    <div class="win_title_bar" id="weatherTitleBar">
      <span>🌤️ WEATHER.EXE</span>
      <div class="win_btn_box">
        <button id="btnWeatherMinimize">_</button>
        <button class="win_max_btn">□</button>
        <button id="btnWeatherClose">×</button>
      </div>
    </div>

    <div class="win_body">
      <div class="select_box">
        <label for="citySelect">地域:</label>
        <select id="citySelect">
          <option value="sapporo">🏔️ 札幌 (北海道)</option>
          <option value="tokyo">🗼 東京 (都庁)</option>
          <option value="okinawa">🌺 那覇 (沖縄)</option>
        </select>
      </div>
      <div class="location">
        <h1 id="cityName">読み込み中...</h1>
        <p id="dateText">0000/00/00</p>
      </div>
      <div class="weather_info">
        <div id="weatherIcon" class="weather_icon">⏳</div>
        <div class="temp_box">
          <span id="temperature" class="temp_num">--</span><span class="temp_unit">°C</span>
        </div>
        <p id="weatherDesc" class="weather_desc">データを取得しています...</p>
      </div>
      <div class="weather_details win_inset_panel">
        <div class="detail_item">
          <span class="detail_label">湿度:</span>
          <span id="humidity" class="detail_value">-- %</span>
        </div>
        <div class="detail_item">
          <span class="detail_label">風速:</span>
          <span id="windSpeed" class="detail_value">-- m/s</span>
        </div>
      </div>
    </div>
  </div>


  <!-- 掲示板 -->
  <div class="bbs_container win_window">

    <div class="win_title_bar" id="bbsTitleBar">
      <span>💬 BBS.EXE</span>
      <div class="win_btn_box">
        <button id="btnBbsMinimize">_</button>
        <button class="win_max_btn">□</button>
        <button id="btnBbsClose">×</button>
      </div>
    </div>
    <div class="win_body">
      <div class="bbs_form">
        <input type="text" id="bbsInputMessage" placeholder="ここにひとこと書き込み..." maxlength="200">
        <button id="btnBbsSend">書き込む</button>
      </div>
      <div class="bbs_body win_inset_panel">
        <div id="bbsList">
          <?php
          if (file_exists('bbs_log.txt')) {
            $lines = file('bbs_log.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $lines = array_reverse($lines);
            foreach ($lines as $line) {
              echo '<div class="bbs_post">' . $line . '</div>';
            }
          }
          ?>
          <div class="bbs_post">1: <span class="bbs_name">管理人 ★</span> : 2026/06/29(月) 15:25 <br>数当てゲームの正解者書き込み板です。</div>
        </div>
      </div>
    </div>
    <div class="win_resize_handle"></div>
  </div>


  <!-- Todoリスト -->
  <div class="todo_container win_window" style="display: none;">
    <div class="win_title_bar" id="todoTitleBar">
      <span>📅 TODO.EXE</span>
      <div class="win_btn_box">
        <button id="btnTodoMinimize">_</button>
        <button class="win_max_btn">□</button>
        <button id="btnTodoClose">×</button>
      </div>
    </div>

    <div class="win_body">
      <div class="todo_form">
        <input type="text" id="todoInput" placeholder="新しいタスクを入力...">
        <button id="btnTodoAdd">追加</button>
      </div>

      <div id="todoListContainer" class="win_inset_panel">
        <ul id="todoList" style="list-style: none; padding: 5px; margin: 0;"></ul>
      </div>
    </div>

    <div class="win_resize_handle"></div>
  </div>


  <footer>
    <div class="start_menu">
      <div class="start_menu_sidebar">Windows 98</div>
      <div class="start_menu_links">
        <div class="menu_item" data-app-id="game">🎯 NUM_GUESS</div>
        <div class="menu_item" data-app-id="note">📄 NOTEPAD</div>
        <div class="menu_item" data-app-id="paint">🎨 PAINT</div>
        <div class="menu_item" data-app-id="bbs">💬 BBS</div>
        <div class="menu_item" data-app-id="calc">🧮 CALC</div>
        <div class="menu_item" data-app-id="weather">🌤️ WEATHER</div>
        <div class="menu_item" data-app-id="todo">📅 TODO</div>
      </div>
    </div>

    <div class="taskbar_tasks">
      <button class="start_btn">⊞</button>
      <button id="taskBtnGame" class="task_btn">🎯 NUM_GUESS</button>
      <button id="taskBtnNote" class="task_btn">📄 NOTEPAD</button>
      <button id="taskBtnPaint" class="task_btn">🎨 PAINT</button>
      <button id="taskBtnBbs" class="task_btn">💬 BBS</button>
      <button id="taskBtnCalc" class="task_btn">🧮 CALC</button>
      <button id="taskBtnWeather" class="task_btn">🌤️ WEATHER</button>
      <button id="taskBtnTodo" class="task_btn">📅 TODO</button>
    </div>

    <div class="taskbar_tray">
      <span class="tray_counter">🐾<span id="countNumber"> 000000</span></span>
    </div>
  </footer>

  <script type="module" src="js/main.js"></script>
</body>

</html>