<?php
// 收到表單資料
$discordId = isset($_POST['discordId']) ? $_POST['discordId'] : '';
$email     = isset($_POST['email']) ? $_POST['email'] : '';

// 為了避免惡意字串破壞 HTML，把特殊字元轉成 &lt;&gt; 等
$discordIdSafe = htmlspecialchars($discordId, ENT_QUOTES);
$emailSafe     = htmlspecialchars($email, ENT_QUOTES);

// 組出要寫入 data.html 的一段內容（<p> 或 <tr> 都可以）
$newLine = "<p>Discord: {$discordIdSafe} / Email: {$emailSafe}</p>\n";

// 把這段文字「附加」到 data.html
file_put_contents('data.html', $newLine, FILE_APPEND);

// 寫入完成後，導回管理員頁面（或其他頁面）
header("Location: admindonotuse.php");
exit;
