use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McqQuestion {
    #[serde(default)]
    pub id: Option<serde_json::Value>,
    pub question: String,
    pub options: Vec<String>,
    pub correct_answer: usize,
    #[serde(default)]
    pub explanation: Option<String>,
    #[serde(default)]
    pub distractor_explanations: Option<Vec<String>>,
    #[serde(default)]
    pub topic: Option<String>,
    #[serde(default)]
    pub difficulty: Option<String>,
    #[serde(default)]
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct DeckMetadata {
    #[serde(default)]
    pub generated_at: Option<String>,
    #[serde(default)]
    pub difficulty: Option<String>,
    #[serde(default)]
    pub total_questions: Option<usize>,
    #[serde(default)]
    pub target_audience: Option<String>,
    #[serde(default)]
    pub source: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McqDeck {
    #[serde(default = "default_deck_title")]
    pub title: String,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub metadata: Option<DeckMetadata>,
    pub questions: Vec<McqQuestion>,
}

fn default_deck_title() -> String {
    "Imported MCQ Deck".to_string()
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DeckStats {
    pub total_questions: usize,
    pub topics: Vec<String>,
    pub difficulty_counts: HashMap<String, usize>,
    pub estimated_minutes: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidationResponse {
    pub valid: bool,
    pub error_message: Option<String>,
    pub deck: Option<McqDeck>,
    pub stats: Option<DeckStats>,
}

#[cfg(target_os = "windows")]
extern "system" {
    fn GetCurrentProcess() -> isize;
    fn SetProcessWorkingSetSize(
        h_process: isize,
        dw_minimum_working_set_size: usize,
        dw_maximum_working_set_size: usize,
    ) -> i32;
}

#[tauri::command]
fn trim_memory() -> bool {
    #[cfg(target_os = "windows")]
    unsafe {
        let handle = GetCurrentProcess();
        SetProcessWorkingSetSize(handle, usize::MAX, usize::MAX) != 0
    }
    #[cfg(not(target_os = "windows"))]
    {
        true
    }
}

#[tauri::command]
fn app_minimize(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
fn app_maximize(window: tauri::Window) {
    if let Ok(is_max) = window.is_maximized() {
        if is_max {
            let _ = window.unmaximize();
        } else {
            let _ = window.maximize();
        }
    } else {
        let _ = window.maximize();
    }
}

#[tauri::command]
fn app_close(app: tauri::AppHandle, window: tauri::Window) {
    let _ = window.close();
    app.exit(0);
}

#[tauri::command]
fn parse_and_validate_deck(raw_json: String) -> ValidationResponse {
    let trimmed = raw_json.trim();
    if trimmed.is_empty() {
        return ValidationResponse {
            valid: false,
            error_message: Some("JSON content is empty.".to_string()),
            deck: None,
            stats: None,
        };
    }

    let parsed_deck: Result<McqDeck, _> = serde_json::from_str(trimmed);
    let deck = match parsed_deck {
        Ok(d) => d,
        Err(deck_err) => {
            match serde_json::from_str::<Vec<McqQuestion>>(trimmed) {
                Ok(questions) => McqDeck {
                    title: "Imported Question Set".to_string(),
                    description: Some("Auto-parsed from array format".to_string()),
                    metadata: Some(DeckMetadata {
                        generated_at: Some(chrono_like_timestamp()),
                        total_questions: Some(questions.len()),
                        difficulty: Some("Mixed".to_string()),
                        ..Default::default()
                    }),
                    questions,
                },
                Err(_) => {
                    return ValidationResponse {
                        valid: false,
                        error_message: Some(format!(
                            "Invalid JSON Schema: {}. Please check that the input conforms to the expected format.",
                            deck_err
                        )),
                        deck: None,
                        stats: None,
                    };
                }
            }
        }
    };

    if deck.questions.is_empty() {
        return ValidationResponse {
            valid: false,
            error_message: Some("The deck contains 0 questions.".to_string()),
            deck: None,
            stats: None,
        };
    }

    let mut topics_set = HashSet::new();
    let mut difficulty_counts = HashMap::new();

    for (index, q) in deck.questions.iter().enumerate() {
        let q_num = index + 1;
        if q.question.trim().is_empty() {
            return ValidationResponse {
                valid: false,
                error_message: Some(format!("Question #{} has empty question text.", q_num)),
                deck: None,
                stats: None,
            };
        }
        if q.options.len() < 2 {
            return ValidationResponse {
                valid: false,
                error_message: Some(format!(
                    "Question #{} must have at least 2 options (found {}).",
                    q_num,
                    q.options.len()
                )),
                deck: None,
                stats: None,
            };
        }
        if q.correct_answer >= q.options.len() {
            return ValidationResponse {
                valid: false,
                error_message: Some(format!(
                    "Question #{} has correct_answer index {} which is out of bounds for {} options.",
                    q_num,
                    q.correct_answer,
                    q.options.len()
                )),
                deck: None,
                stats: None,
            };
        }

        if let Some(ref t) = q.topic {
            if !t.trim().is_empty() {
                topics_set.insert(t.trim().to_string());
            }
        }

        let diff = q
            .difficulty
            .as_deref()
            .unwrap_or("Medium")
            .to_ascii_lowercase();
        *difficulty_counts.entry(diff).or_insert(0) += 1;
    }

    let mut topics: Vec<String> = topics_set.into_iter().collect();
    topics.sort();

    let total = deck.questions.len();
    let stats = DeckStats {
        total_questions: total,
        topics,
        difficulty_counts,
        estimated_minutes: (total as f32 * 1.5).ceil() as usize,
    };

    ValidationResponse {
        valid: true,
        error_message: None,
        deck: Some(deck),
        stats: Some(stats),
    }
}

fn chrono_like_timestamp() -> String {
    "Imported Session".to_string()
}

fn get_storage_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    use tauri::Manager;
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
    if !dir.exists() {
        std::fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create app data dir: {}", e))?;
    }
    Ok(dir)
}

#[tauri::command]
fn get_data_directory(app: tauri::AppHandle) -> Result<String, String> {
    let dir = get_storage_dir(&app)?;
    Ok(dir.to_string_lossy().to_string())
}

#[tauri::command]
fn open_data_directory(app: tauri::AppHandle) -> Result<bool, String> {
    let dir = get_storage_dir(&app)?;
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("explorer").arg(&dir).spawn();
    }
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("open").arg(&dir).spawn();
    }
    #[cfg(target_os = "linux")]
    {
        let _ = std::process::Command::new("xdg-open").arg(&dir).spawn();
    }
    Ok(true)
}

#[tauri::command]
fn load_persistent_decks(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let dir = get_storage_dir(&app)?;
    let file_path = dir.join("decks.json");
    if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read decks file: {}", e))?;
        Ok(Some(content))
    } else {
        Ok(None)
    }
}

#[tauri::command]
fn save_persistent_decks(app: tauri::AppHandle, json_content: String) -> Result<bool, String> {
    let dir = get_storage_dir(&app)?;
    let file_path = dir.join("decks.json");

    // Optional rolling backup if file already exists and has content
    if file_path.exists() {
        let backup_dir = dir.join("backups");
        let _ = std::fs::create_dir_all(&backup_dir);
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        let backup_file = backup_dir.join(format!("decks-backup-{}.json", timestamp));
        let _ = std::fs::copy(&file_path, backup_file);

        // Keep at most 10 recent backups
        if let Ok(entries) = std::fs::read_dir(&backup_dir) {
            let mut backups: Vec<_> = entries.filter_map(|e| e.ok()).collect();
            if backups.len() > 10 {
                backups.sort_by_key(|e| e.metadata().and_then(|m| m.modified()).ok());
                for old in backups.iter().take(backups.len() - 10) {
                    let _ = std::fs::remove_file(old.path());
                }
            }
        }
    }

    std::fs::write(&file_path, json_content)
        .map_err(|e| format!("Failed to write decks file: {}", e))?;
    Ok(true)
}

#[tauri::command]
fn load_persistent_settings(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let dir = get_storage_dir(&app)?;
    let file_path = dir.join("settings.json");
    if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read settings file: {}", e))?;
        Ok(Some(content))
    } else {
        Ok(None)
    }
}

#[tauri::command]
fn save_persistent_settings(app: tauri::AppHandle, json_content: String) -> Result<bool, String> {
    let dir = get_storage_dir(&app)?;
    let file_path = dir.join("settings.json");
    std::fs::write(&file_path, json_content)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;
    Ok(true)
}

#[tauri::command]
fn install_github_update(download_url: String, filename: String) -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    {
        let temp_dir = std::env::temp_dir();
        let target_path = temp_dir.join(&filename);
        let target_str = target_path.to_string_lossy().to_string();

        // Download via powershell WebClient with TLS 1.2
        let dl_cmd = format!(
            "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('{}', '{}')",
            download_url, target_str
        );

        let status = std::process::Command::new("powershell")
            .args(&["-NoProfile", "-NonInteractive", "-Command", &dl_cmd])
            .status()
            .map_err(|e| format!("Failed to execute download transfer: {}", e))?;

        if !status.success() {
            return Err("Download process exited with an error".to_string());
        }

        if filename.ends_with(".msi") {
            let _ = std::process::Command::new("msiexec")
                .args(&["/i", &target_str])
                .spawn()
                .map_err(|e| format!("Failed to launch MSI installer: {}", e))?;
        } else if filename.ends_with(".exe") {
            let _ = std::process::Command::new(&target_str)
                .spawn()
                .map_err(|e| format!("Failed to launch executable installer: {}", e))?;
        } else {
            let _ = std::process::Command::new("explorer")
                .args(&["/select,", &target_str])
                .spawn();
        }

        Ok(true)
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = (download_url, filename);
        Err("Automated installer execution is currently supported on Windows".to_string())
    }
}

#[derive(Clone, Serialize, Deserialize)]
pub struct UpdateDownloadProgress {
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub percentage: f64,
}

#[tauri::command]
async fn download_and_self_replace(
    app: tauri::AppHandle,
    download_url: String,
    filename: String,
) -> Result<bool, String> {
    use std::io::Write;
    use tauri::Emitter;
    use futures_util::StreamExt;

    let client = reqwest::Client::builder()
        .user_agent("Synapse-MCQ-Studio-Updater")
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .get(&download_url)
        .send()
        .await
        .map_err(|e| format!("Failed to connect to download source: {}", e))?;

    let total_size = response.content_length().unwrap_or(0);
    let mut stream = response.bytes_stream();
    let temp_dir = std::env::temp_dir();
    let temp_download_path = temp_dir.join(format!(
        "synapse_update_{}_{}",
        std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
        filename
    ));

    let mut file = std::fs::File::create(&temp_download_path)
        .map_err(|e| format!("Failed to create temporary file: {}", e))?;

    let mut downloaded: u64 = 0;

    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| format!("Error reading chunk: {}", e))?;
        file.write_all(&chunk)
            .map_err(|e| format!("Error writing chunk to file: {}", e))?;
        downloaded += chunk.len() as u64;

        let percentage = if total_size > 0 {
            (downloaded as f64 / total_size as f64) * 100.0
        } else {
            0.0
        };

        let _ = app.emit(
            "updater-download-progress",
            UpdateDownloadProgress {
                downloaded_bytes: downloaded,
                total_bytes: total_size,
                percentage,
            },
        );
    }

    file.flush().map_err(|e| e.to_string())?;
    drop(file);

    #[cfg(target_os = "windows")]
    {
        // If file is zip, extract executable
        let final_exe_path = if filename.to_lowercase().ends_with(".zip") {
            let zip_file = std::fs::File::open(&temp_download_path).map_err(|e| e.to_string())?;
            let mut archive = zip::ZipArchive::new(zip_file).map_err(|e| e.to_string())?;
            let extracted_exe = temp_dir.join(format!(
                "synapse_extracted_{}.exe",
                std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs()
            ));
            let mut found = false;
            for i in 0..archive.len() {
                let mut f = archive.by_index(i).map_err(|e| e.to_string())?;
                if f.name().to_lowercase().ends_with(".exe") {
                    let mut out = std::fs::File::create(&extracted_exe).map_err(|e| e.to_string())?;
                    std::io::copy(&mut f, &mut out).map_err(|e| e.to_string())?;
                    found = true;
                    break;
                }
            }
            if !found {
                return Err("Could not find executable inside zip archive".to_string());
            }
            extracted_exe
        } else {
            temp_download_path
        };

        let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
        let backup_exe = current_exe.with_extension("exe.old");

        // Attempt direct atomic executable swap on disk
        let direct_swap = (|| -> Result<(), std::io::Error> {
            let _ = std::fs::remove_file(&backup_exe);
            std::fs::rename(&current_exe, &backup_exe)?;
            std::fs::copy(&final_exe_path, &current_exe)?;
            Ok(())
        })();

        if direct_swap.is_ok() {
            // Direct swap completed: spawn new process and exit cleanly
            let _ = std::process::Command::new(&current_exe).spawn();
            std::process::exit(0);
        } else {
            // If direct file replacement failed (e.g. Program Files path requiring silent installer),
            // run silent installer without UAC wizards
            if final_exe_path.to_string_lossy().ends_with(".msi") {
                let _ = std::process::Command::new("msiexec")
                    .args(&["/i", &final_exe_path.to_string_lossy(), "/qn", "/norestart"])
                    .spawn();
            } else {
                let _ = std::process::Command::new(&final_exe_path)
                    .args(&["/SILENT", "/VERYSILENT", "/SUPPRESSMSGBOXES", "/NORESTART"])
                    .spawn();
            }
            std::thread::sleep(std::time::Duration::from_millis(1500));
            std::process::exit(0);
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(true)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            trim_memory,
            app_minimize,
            app_maximize,
            app_close,
            parse_and_validate_deck,
            get_data_directory,
            open_data_directory,
            load_persistent_decks,
            save_persistent_decks,
            load_persistent_settings,
            save_persistent_settings,
            install_github_update,
            download_and_self_replace
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
