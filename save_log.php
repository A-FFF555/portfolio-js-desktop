<?php
$raw_data = file_get_contents('php://input');
$data = json_decode($raw_data, true);

// 「type」と「value」が両方届いているかチェック
if (!empty($data['type']) && isset($data['value'])) {

  $type = $data['type'];
  $value = $data['value'];

  // 現在の日時を作成
  date_default_timezone_set('Asia/Tokyo');
  $weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  $dateStr = date('Y/m/d') . '(' . $weekdays[(int) date('w')] . ')' . date('H:i');

  // タイプによって、アイコン、名前、本文のテンプレートを切り替える
  switch ($type) {
    case 'game':

      $number = filter_var(
        $value,
        FILTER_VALIDATE_INT,
        ['options' => ['min_range' => 1, 'max_range' => 100]]
      );
      if ($number === false) {
        http_response_code(400);
        exit('数字が不正です。');
      }

      $icon = '🎯';
      $name = '名無しさん＠正解者';
      $content = "【NUM_GUESS】見事に正解の数字「{$number}」を的中させました！";
      break;

    case 'counter':

      $number = filter_var(
        $value,
        FILTER_VALIDATE_INT,
        ['options' => ['min_range' => 1]]
      );
      if ($number === false) {
        http_response_code(400);
        exit('数字が不正です。');
      }

      $icon = '🐾';
      $name = 'システム通知';
      $content = "祝！誰かが【{$number}人目】のキリ番・ゾロ目を踏みました！";
      break;

    case 'bbs':

      if (!is_string($value) || trim($value) === '') {
        http_response_code(400);
        exit('本文が不正です。');
      }

      $icon = '💬';
      $name = '名無しさん＠デスクトップ';

      if (!is_string($value)) {
        http_response_code(400);
        exit('本文が不正です。');
      }

      $value = trim($value);

      if (
        $value === '' ||
        mb_strlen($value, 'UTF-8') > 200 ||
        preg_match('/[\r\n]/', $value)
      ) {
        http_response_code(400);
        exit('本文は改行なしの200文字以内にしてください。');
      }

      $content = htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); // 手動書き込みは安全のためにサニタイズ
      break;

    default:
      http_response_code(400);
      exit('種類が不正です。');
  }

  $intervals = [
    'bbs' => 5,
    'game' => 2,
    'counter' => 10,
  ];

  $rateFile = sys_get_temp_dir()
    . '/retro_rate_' . hash('sha256', __DIR__) . '.json';

  $fp = fopen($rateFile, 'c+');
  if ($fp === false) {
    http_response_code(500);
    exit('投稿状態を確認できません');
  }

  if (!flock($fp, LOCK_EX)) {
    fclose($fp);
    http_response_code(500);
    exit('投稿状態を確認できません');
  }

  $stored = stream_get_contents($fp);
  $times = json_decode($stored ?: '{}', true);
  if (!is_array($times)) {
    $times = [];
  }

  $now = time();
  $times = array_filter(
    $times,
    static fn($last) => is_int($last) && $last > $now - 60
  );

  $key = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . $type);
  $interval = $intervals[$type];

  if (isset($times[$key]) && $now - $times[$key] < $interval) {
    flock($fp, LOCK_UN);
    fclose($fp);
    http_response_code(429);
    exit('少し待ってから投稿してください');
  }

  $times[$key] = $now;
  $output = json_encode($times);

  rewind($fp);
  $ok = $output !== false
    && ftruncate($fp, 0) !== false
    && fwrite($fp, $output) === strlen($output)
    && fflush($fp);

  flock($fp, LOCK_UN);
  fclose($fp);

  if (!$ok) {
    http_response_code(500);
    exit('投稿状態を保存できません');
  }


  // 最終的なBBSの1行（HTML）を組み立てる
  $logLine = "<span class='bbs_icon'>{$icon}</span> <span class='bbs_name'>{$name}</span> : {$dateStr} <br> {$content}";

  // ファイルに保存
  $logFile = __DIR__ . '/bbs_log.txt';
  $fp = fopen($logFile, 'c+');

  if ($fp === false || !flock($fp, LOCK_EX)) {
    http_response_code(500);
    exit('ログを開けませんでした。');
  }

  $lines = [];
  rewind($fp);

  while (($line = fgets($fp)) !== false) {
    $lines[] = rtrim($line, "\r\n");

    if (count($lines) > 99) {
      array_shift($lines);
    }
  }

  $lines[] = $logLine;
  $output = implode("\n", $lines) . "\n";

  rewind($fp);
  $ok = ftruncate($fp, 0) !== false
    && fwrite($fp, $output) === strlen($output)
    && fflush($fp);

  flock($fp, LOCK_UN);
  fclose($fp);

  if (!$ok) {
    http_response_code(500);
    exit('ログを保存できませんでした。');
  }

  echo "タイプ [{$type}] のログを保存しました。";
} else {
  echo "エラー：データが不足しています。";
}
