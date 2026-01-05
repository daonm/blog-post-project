// ===================================
// 키워드 분석 모듈
// ===================================

class KeywordAnalyzer {
    constructor() {
        this.currentAnalysis = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const analyzeBtn = document.getElementById('analyzeKeyword');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeKeyword());
        }

        const sendBtn = document.getElementById('sendToPostCreator');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendToPostCreator());
        }

        // Enter 키로 분석
        const input = document.getElementById('keywordInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.analyzeKeyword();
                }
            });
        }
    }

    async analyzeKeyword() {
        const input = document.getElementById('keywordInput');
        const keyword = input.value.trim();

        if (!keyword) {
            Helpers.showToast('키워드를 입력해주세요.', 'warning');
            return;
        }

        Helpers.showLoading('키워드 분석 중...');
        const analysis = await NaverAPI.searchKeyword(keyword);
        Helpers.hideLoading();

        if (analysis) {
            this.currentAnalysis = analysis;
            this.displayResults(analysis);
            Storage.saveToHistory('keyword', { keyword, analysis });
        }
    }

    displayResults(analysis) {
        const resultsArea = document.getElementById('keywordResults');
        if (!resultsArea) return;

        // 통계 표시
        document.getElementById('monthlySearches').textContent = analysis.monthlySearches;
        document.getElementById('competition').textContent = analysis.competition;
        document.getElementById('recommendScore').textContent = `${analysis.score}점`;

        // 경쟁도에 따라 색상 변경
        const competitionEl = document.getElementById('competition');
        if (competitionEl) {
            competitionEl.style.color =
                analysis.competition === '낮음' ? 'var(--accent-success)' :
                    analysis.competition === '높음' ? 'var(--accent-error)' :
                        'var(--accent-warning)';
        }

        // SEO 전략 표시
        const strategyEl = document.getElementById('seoStrategy');
        if (strategyEl) {
            strategyEl.innerHTML = analysis.strategy;
        }

        // 연관 키워드 표시
        const relatedEl = document.getElementById('relatedKeywords');
        if (relatedEl && analysis.relatedKeywords) {
            let html = '<h4 style="margin-bottom: 1rem;">연관 키워드</h4>';
            html += '<div class="tags-list">';

            analysis.relatedKeywords.forEach(keyword => {
                html += `<span class="tag" style="cursor: pointer;" onclick="window.keywordAnalyzer.analyzeRelated('${keyword}')">${keyword}</span>`;
            });

            html += '</div>';
            relatedEl.innerHTML = html;
        }

        // 데모 데이터 표시
        if (analysis.isDemo) {
            Helpers.showToast('데모 데이터입니다. 실제 API 연동 시 정확한 데이터를 제공합니다.', 'info');
        }

        resultsArea.style.display = 'block';
        resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    analyzeRelated(keyword) {
        const input = document.getElementById('keywordInput');
        if (input) {
            input.value = keyword;
            this.analyzeKeyword();
        }
    }

    sendToPostCreator() {
        if (!this.currentAnalysis) {
            Helpers.showToast('먼저 키워드를 분석해주세요.', 'warning');
            return;
        }

        // 포스트 생성 탭으로 전환
        window.app.switchTab('post-creator');

        // 제목 입력란에 키워드 설정
        const titleInput = document.getElementById('postTitle');
        if (titleInput) {
            titleInput.value = this.currentAnalysis.keyword;

            // 추가 요청사항에 SEO 정보 추가
            const additionalInput = document.getElementById('additionalRequests');
            if (additionalInput) {
                additionalInput.value = `키워드: ${this.currentAnalysis.keyword}\n경쟁도: ${this.currentAnalysis.competition}\n연관 키워드: ${this.currentAnalysis.relatedKeywords.join(', ')}`;
            }

            titleInput.focus();
        }

        Helpers.showToast('포스트 생성 탭으로 이동했습니다!', 'success');
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.keywordAnalyzer = new KeywordAnalyzer();
});
