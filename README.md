https://sunrise201238-sys.github.io/photo-aesthetic-assistant/

# Photo Assistant

A lightweight, privacy-first web app that fixes a photo's framing and tone —
straighten, brighten, sharpen, and correct colour — entirely in your browser.

Drop in a photo and toggle the fixes you want. Each one is an independent
on/off switch, so you can apply one, several, or none. Everything runs locally:
**no uploads, no accounts, no tracking.**

## Features

Each feature is a separate toggle and is applied independently.

- **Composition** — straightens a tilted photo and crops the corners clean
  (zooms in just enough that there are no blank edges). Two modes:
  - **Landscape** — levels the whole scene from its dominant straight lines
    (horizons, building edges), with a gentle rule-of-thirds nudge applied only
    when it won't crop the subject.
  - **Object** — straightens a single clear object (e.g. a pen or bottle),
    snapping its long axis upright (horizontal or vertical).
  - It only acts when confident — ambiguous or already-level shots are left
    as-is rather than rotated by a wrong guess.
- **Shadow** — gently lifts the dark areas so you can see into the shadows,
  without blowing out the highlights.
- **Detail** — a subtle "punch": slightly deeper blacks, eased highlights, a
  light sharpen, and a hint of grain for a crisp but natural finish. Colour-safe
  (won't shift the white balance).
- **White balance** — neutralizes a warm or cool colour cast so whites read as
  natural white light. _On by default._
- **Show guides** — overlays rule-of-thirds lines and the detected
  subject/horizon on the preview. Display only — it is not baked into the
  downloaded image.

All of the analysis (brightness, edges, tilt, subject, white point) is computed
on-device from the photo's own pixels — there is no AI service and no network
call. It isn't a perfect judge of taste, just a quiet assistant that cleans
structure and tone a little.

---

# 影像助手

輕量、重視隱私的網頁工具，完全在瀏覽器內修正相片的構圖與色調——校正傾斜、提亮、銳化、校正色彩。

上傳相片後，自由切換想要的修正功能；每一項都是獨立的開關，可單獨、組合或全部關閉使用。
所有處理皆在本機完成：**不需上傳、不用登入、不會追蹤。**

## 功能

每項功能皆為獨立開關，分別套用。

- **構圖（Composition）**——校正傾斜並裁切邊角（適度放大，避免留下空白）。兩種模式：
  - **場景（Landscape）**——依主要直線（地平線、建築邊緣）校平整個場景，並在不裁切主體的前提下，輕微靠向三分線。
  - **物件（Object）**——將單一明顯物件（如筆或瓶子）轉正，使其長軸對齊水平或垂直。
  - 僅在判斷有把握時才動作；模稜兩可或本來就水平的相片會維持原樣，不會亂轉。
- **陰影（Shadow）**——適度提亮暗部，找回陰影細節，同時保護高光不過曝。
- **細節（Detail）**——細緻的「層次感」：略加深黑、收斂高光、輕度銳化並加入少許顆粒，呈現清晰又自然的質感；不影響白平衡。
- **白平衡（White balance）**——校正偏暖或偏冷的色偏，讓白色呈現自然白光。_預設開啟。_
- **顯示輔助線（Show guides）**——在預覽上疊加三分線與偵測到的主體／地平線；僅供顯示，不會寫入下載的影像。

所有分析（亮度、邊緣、傾斜、主體、白點）都在本機依相片像素計算——沒有 AI 服務、沒有任何網路請求。
它不是審美裁判，而是默默協助你整理結構與色調的小助手。
