// ===================================
// 메인 애플리케이션 로직
// ===================================

class BloggingProApp {
    constructor() {
        this.init();
    }

    init() {
        // 초기화
        this.loadSavedData();
        this.setupEventListeners();
        this.initializeModules();

        console.log('올인원 블로깅 프로 초기화 완료!');
    }

    // 저장된 데이터 로드
    loadSavedData() {
        // API 키 로드
        Storage.loadApiKeys();

        // 테마 로드 및 적용
        const theme = Storage.loadTheme();
        document.documentElement.setAttribute('data-theme', theme);
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 테마 토글
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // 네비게이션 탭
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // 컬러 테마 선택
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                themeButtons.forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
                STATE.selectedColorTheme = e.currentTarget.dataset.theme;
            });
        });

        // 글쓰기 스타일 선택
        const styleButtons = document.querySelectorAll('.style-btn');
        styleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                styleButtons.forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
                STATE.selectedWritingStyle = e.currentTarget.dataset.style;
            });
        });

        // 이미지 탭
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const subtab = e.currentTarget.dataset.subtab;
                this.switchSubTab(subtab);
            });
        });
    }

    // 모듈 초기화
    initializeModules() {
        // 각 모듈이 로드되면 자동으로 초기화됩니다
        console.log('모듈 초기화 중...');
    }

    // 테마 토글
    toggleTheme() {
        const currentTheme = STATE.currentTheme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        STATE.currentTheme = newTheme;
        Storage.saveTheme(newTheme);
    }

    // 탭 전환
    switchTab(tabName) {
        // 모든 섹션 숨기기
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active'));

        // 선택된 섹션 표시
        const targetSection = document.getElementById(tabName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // 네비게이션 버튼 활성화 상태 변경
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            if (button.dataset.tab === tabName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        STATE.currentTab = tabName;
    }

    // 서브탭 전환 (이미지 생성 섹션)
    switchSubTab(subtabName) {
        const subtabs = document.querySelectorAll('.subtab-content');
        subtabs.forEach(subtab => subtab.classList.remove('active'));

        const targetSubtab = document.getElementById(subtabName);
        if (targetSubtab) {
            targetSubtab.classList.add('active');
        }

        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            if (button.dataset.subtab === subtabName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
}

// DOM 로드 완료 후 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BloggingProApp();
});
