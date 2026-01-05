// ===================================
// 주제 생성 모듈
// ===================================

class TopicGenerator {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 카테고리별 추천
        const categoryBtn = document.getElementById('generateCategoryTopics');
        if (categoryBtn) {
            categoryBtn.addEventListener('click', () => this.generateByCategory());
        }

        // E-EAT 기반 추천
        const eeatBtn = document.getElementById('generateEEATTopics');
        if (eeatBtn) {
            eeatBtn.addEventListener('click', () => this.generateByEEAT());
        }

        // 에버그린 콘텐츠
        const evergreenBtn = document.getElementById('generateEvergreenTopics');
        if (evergreenBtn) {
            evergreenBtn.addEventListener('click', () => this.generateEvergreen());
        }

        // 롱테일 키워드
        const longtailBtn = document.getElementById('generateLongtailTopics');
        if (longtailBtn) {
            longtailBtn.addEventListener('click', () => this.generateLongtail());
        }

        // 메모/파일 기반
        const memoBtn = document.getElementById('generateMemoTopics');
        if (memoBtn) {
            memoBtn.addEventListener('click', () => this.generateFromMemo());
        }

        // 결과 초기화
        const clearBtn = document.getElementById('clearTopicResults');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearResults());
        }

        // 파일 업로드
        const fileInput = document.getElementById('fileUpload');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    }

    async generateByCategory() {
        const select = document.getElementById('categorySelect');
        const category = select.value;

        if (!category) {
            Helpers.showToast('카테고리를 선택해주세요.', 'warning');
            return;
        }

        const categoryLabel = select.options[select.selectedIndex].text;

        Helpers.showLoading('주제 생성 중...');
        const result = await GeminiAPI.generateTopics('category', categoryLabel);
        Helpers.hideLoading();

        if (result) {
            this.displayResults(result, '카테고리별 추천');
            Storage.saveToHistory('topic', { type: 'category', input: categoryLabel, result });
        }
    }

    async generateByEEAT() {
        const input = document.getElementById('expertiseField');
        const field = input.value.trim();

        if (!field) {
            Helpers.showToast('전문 분야를 입력해주세요.', 'warning');
            return;
        }

        Helpers.showLoading('주제 생성 중...');
        const result = await GeminiAPI.generateTopics('eeat', field);
        Helpers.hideLoading();

        if (result) {
            this.displayResults(result, 'E-EAT 기반 추천');
            Storage.saveToHistory('topic', { type: 'eeat', input: field, result });
        }
    }

    async generateEvergreen() {
        const input = document.getElementById('evergreenTopic');
        const topic = input.value.trim();

        if (!topic) {
            Helpers.showToast('관심 주제를 입력해주세요.', 'warning');
            return;
        }

        Helpers.showLoading('주제 생성 중...');
        const result = await GeminiAPI.generateTopics('evergreen', topic);
        Helpers.hideLoading();

        if (result) {
            this.displayResults(result, '에버그린 콘텐츠');
            Storage.saveToHistory('topic', { type: 'evergreen', input: topic, result });
        }
    }

    async generateLongtail() {
        const input = document.getElementById('longtailKeyword');
        const keyword = input.value.trim();

        if (!keyword) {
            Helpers.showToast('기본 키워드를 입력해주세요.', 'warning');
            return;
        }

        Helpers.showLoading('주제 생성 중...');
        const result = await GeminiAPI.generateTopics('longtail', keyword);
        Helpers.hideLoading();

        if (result) {
            this.displayResults(result, '롱테일 키워드');
            Storage.saveToHistory('topic', { type: 'longtail', input: keyword, result });
        }
    }

    async generateFromMemo() {
        const textarea = document.getElementById('memoContent');
        let content = textarea.value.trim();

        // 파일이 업로드되었다면 파일 내용 사용
        const fileContent = textarea.dataset.fileContent;
        if (fileContent) {
            content = fileContent;
        }

        if (!content) {
            Helpers.showToast('메모를 입력하거나 파일을 업로드해주세요.', 'warning');
            return;
        }

        Helpers.showLoading('주제 생성 중...');
        const result = await GeminiAPI.generateTopics('memo', content);
        Helpers.hideLoading();

        if (result) {
            this.displayResults(result, '메모/파일 기반');
            Storage.saveToHistory('topic', { type: 'memo', input: content.substring(0, 200), result });
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const content = await Helpers.readFile(file);
            const textarea = document.getElementById('memoContent');

            // 이미지 파일이 아닌 경우에만 텍스트로 표시
            if (!file.type.startsWith('image/')) {
                textarea.value = `[파일: ${file.name}]\n\n${content}`;
                textarea.dataset.fileContent = content;
            } else {
                Helpers.showToast('텍스트 파일만 업로드 가능합니다.', 'warning');
            }
        } catch (error) {
            console.error('파일 읽기 오류:', error);
            Helpers.showToast('파일을 읽을 수 없습니다.', 'error');
        }
    }

    displayResults(content, title) {
        const resultsArea = document.getElementById('topicResults');
        const resultsContent = document.getElementById('topicResultsContent');

        if (!resultsArea || !resultsContent) return;

        // 결과를 HTML로 변환
        const html = this.formatResults(content, title);
        resultsContent.innerHTML = html;

        resultsArea.style.display = 'block';

        // 결과 영역으로 스크롤
        resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // 상태 저장
        STATE.generatedTopics.push({ title, content, timestamp: new Date().toISOString() });
    }

    formatResults(content, title) {
        let html = `<div class="topic-result">`;
        html += `<h3 style="margin-bottom: 1rem; color: var(--accent-primary);">${title}</h3>`;

        // 줄바꿈을 <br>로 변환하고 번호 매기기 스타일 적용
        const lines = content.split('\n').filter(line => line.trim());
        html += '<div class="topic-list">';

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed) {
                // 번호가 있는 줄인지 확인
                if (/^\d+\./.test(trimmed)) {
                    html += `<div class="topic-item">${trimmed}</div>`;
                } else {
                    html += `<p>${trimmed}</p>`;
                }
            }
        });

        html += '</div>';

        // 포스트 생성으로 전달 버튼들
        html += '<div class="topic-actions" style="margin-top: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">';

        lines.forEach((line, index) => {
            const match = line.match(/^\d+\.\s*(.+?)\s*-/);
            if (match) {
                const topicTitle = match[1].trim();
                html += `<button class="btn btn-secondary btn-sm" onclick="window.topicGenerator.sendToPostCreator('${topicTitle.replace(/'/g, "\\'")}')">
                    "${topicTitle}" 사용
                </button>`;
            }
        });

        html += '</div>';
        html += '</div>';

        // 스타일 추가
        html += `
            <style>
                .topic-list { line-height: 1.8; }
                .topic-item { 
                    padding: 0.75rem;
                    margin: 0.5rem 0;
                    background: var(--bg-primary);
                    border-left: 3px solid var(--accent-primary);
                    border-radius: var(--radius-sm);
                }
                .topic-actions { margin-top: 1.5rem; }
            </style>
        `;

        return html;
    }

    sendToPostCreator(topic) {
        // 포스트 생성 탭으로 전환
        window.app.switchTab('post-creator');

        // 제목 입력란에 주제 설정
        const titleInput = document.getElementById('postTitle');
        if (titleInput) {
            titleInput.value = topic;
            titleInput.focus();
        }

        Helpers.showToast('포스트 생성 탭으로 이동했습니다!', 'success');
    }

    clearResults() {
        const resultsArea = document.getElementById('topicResults');
        const resultsContent = document.getElementById('topicResultsContent');

        if (resultsArea) resultsArea.style.display = 'none';
        if (resultsContent) resultsContent.innerHTML = '';
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.topicGenerator = new TopicGenerator();
});
