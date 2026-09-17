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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
            parse_and_validate_deck
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
