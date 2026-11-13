/**
 * ============================================================================
 * ✍️ SỔ TAY TIỂU THUYẾT CỦA BI — PROGRESSIVE WEB APP SERVICE WORKER (v38.0)
 * ============================================================================
 * Hỗ trợ chạy ứng dụng mượt mà trên cả Điện thoại (iOS / Android) và Máy tính
 * (Windows / macOS / Linux) ngay cả khi mất kết nối mạng.
 * ============================================================================
 */
const CACHE_NAME = 'bi-novel-studio-pwa-v41';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './mod01_core_kernel_and_event_bus.js',
  './mod02_gemini_models_catalog_and_router_config.js',
  './mod03_humanized_ui_toast_and_vn_nlp_utils.js',
  './mod04_indexeddb_storage_and_emergency_vault.js',
  './mod05_local_filesystem_and_folder_sync.js',
  './mod06_document_importer_docx_pdf_txt.js',
  './mod07_bm25_local_rag_memory_engine.js',
  './mod08_chapter_tree_and_bidirectional_approval.js',
  './mod09_three_tier_autosave_and_undo_stack.js',
  './mod10_version_time_machine_and_live_preview.js',
  './mod11_google_docs_ai_diff_review_engine.js',
  './mod12_story_bible_and_lore_matrix_engine.js',
  './mod13_scene_transition_and_pov_builder.js',
  './mod14_five_modes_system_prompts_studio.js',
  './mod15_api_key_vault_and_zero_congestion_client.js',
  './mod16_master_prompt_synthesizer_two_step.js',
  './mod17_tab3_five_modes_output_controller.js',
  './mod18_mode5_plot_diagram_and_timeline_studio.js',
  './mod19_smart_approval_and_bible_extractor.js',
  './mod20_bidirectional_pomodoro_sync_engine.js',
  './mod21_mp3_ab_loop_and_webaudio_soundscape.js',
  './mod22_typography_and_60fps_ambient_canvas.js',
  './mod23_dialogue_normalizer_and_vn_editor_tools.js',
  './mod24_cliche_scanner_and_pacing_heatmap.js',
  './mod25_webnovel_secret_features_and_lore_whisper.js',
  './mod26_pdf_docx_epub_custom_book_exporter.js',
  './mod27_mascot_bi_so_8_and_dual_chat_assistant.js',
  './mod28_animated_video_tutorial_with_subtitles.js',
  './mod29_responsive_mobile_pwa_and_six_screens_nav.js',
  './mod30_master_bootloader_and_integrity_guard.js',
  './mod31_full_feature_directory_and_inspector.js',
  './mod32_ambient_backdrop_engine_and_argon_bridge.js',
  './mod33_unified_connection_guard_and_live_voice_studio.js',
  './mod34_bug_report_and_doc_relay.js',
  './mod35_author_credits_and_social_hub.js',
  './mod36_zero_reload_save_shield_and_integrity_guard.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('generativelanguage.googleapis.com')) {
    return;
  }
  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200 && url.origin === self.location.origin) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
