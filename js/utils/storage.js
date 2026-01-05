// ===================================
// 로컬 스토리지 관리
// ===================================

const Storage = {
    // API 키 저장
    saveApiKeys(keys) {
        try {
            localStorage.setItem(CONFIG.storageKeys.apiKeys, JSON.stringify(keys));
            CONFIG.apiKeys = { ...CONFIG.apiKeys, ...keys };
            return true;
        } catch (error) {
            console.error('API 키 저장 실패:', error);
            return false;
        }
    },

    // API 키 불러오기
    loadApiKeys() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKeys.apiKeys);
            if (saved) {
                const keys = JSON.parse(saved);
                CONFIG.apiKeys = { ...CONFIG.apiKeys, ...keys };
                return keys;
            }
            return null;
        } catch (error) {
            console.error('API 키 로드 실패:', error);
            return null;
        }
    },

    // 테마 저장
    saveTheme(theme) {
        try {
            localStorage.setItem(CONFIG.storageKeys.theme, theme);
            STATE.currentTheme = theme;
            return true;
        } catch (error) {
            console.error('테마 저장 실패:', error);
            return false;
        }
    },

    // 테마 불러오기
    loadTheme() {
        try {
            const theme = localStorage.getItem(CONFIG.storageKeys.theme);
            if (theme) {
                STATE.currentTheme = theme;
                return theme;
            }
            return 'light';
        } catch (error) {
            console.error('테마 로드 실패:', error);
            return 'light';
        }
    },

    // 히스토리 저장
    saveToHistory(type, data) {
        try {
            const history = this.getHistory();
            const entry = {
                id: Date.now(),
                type,
                data,
                timestamp: new Date().toISOString()
            };

            history.unshift(entry);

            // 최대 100개까지만 저장
            if (history.length > 100) {
                history.pop();
            }

            localStorage.setItem(CONFIG.storageKeys.history, JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('히스토리 저장 실패:', error);
            return false;
        }
    },

    // 히스토리 불러오기
    getHistory(type = null) {
        try {
            const saved = localStorage.getItem(CONFIG.storageKeys.history);
            if (saved) {
                const history = JSON.parse(saved);
                if (type) {
                    return history.filter(item => item.type === type);
                }
                return history;
            }
            return [];
        } catch (error) {
            console.error('히스토리 로드 실패:', error);
            return [];
        }
    },

    // 히스토리 삭제
    clearHistory() {
        try {
            localStorage.removeItem(CONFIG.storageKeys.history);
            return true;
        } catch (error) {
            console.error('히스토리 삭제 실패:', error);
            return false;
        }
    },

    // 설정 저장
    saveSettings(settings) {
        try {
            const current = this.getSettings();
            const updated = { ...current, ...settings };
            localStorage.setItem(CONFIG.storageKeys.settings, JSON.stringify(updated));
            return true;
        } catch (error) {
            console.error('설정 저장 실패:', error);
            return false;
        }
    },

    // 설정 불러오기
    getSettings() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKeys.settings);
            if (saved) {
                return JSON.parse(saved);
            }
            return {};
        } catch (error) {
            console.error('설정 로드 실패:', error);
            return {};
        }
    },

    // 임시 데이터 저장 (세션 스토리지)
    saveTempData(key, data) {
        try {
            sessionStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('임시 데이터 저장 실패:', error);
            return false;
        }
    },

    // 임시 데이터 불러오기
    getTempData(key) {
        try {
            const saved = sessionStorage.getItem(key);
            if (saved) {
                return JSON.parse(saved);
            }
            return null;
        } catch (error) {
            console.error('임시 데이터 로드 실패:', error);
            return null;
        }
    },

    // 임시 데이터 삭제
    clearTempData(key) {
        try {
            if (key) {
                sessionStorage.removeItem(key);
            } else {
                sessionStorage.clear();
            }
            return true;
        } catch (error) {
            console.error('임시 데이터 삭제 실패:', error);
            return false;
        }
    }
};

// 전역으로 내보내기
window.Storage = Storage;
