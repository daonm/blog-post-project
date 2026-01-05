// ===================================
// SNS 마케팅 모듈
// ===================================

class SNSMarketing {
    constructor() {
        this.generatedContent = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadLastPost(); // 마지막 포스트 자동 로드
    }

    loadLastPost() {
        // STATE에서 마지막 생성된 포스트 로드
        if (STATE.lastGeneratedPost) {
            const titleInput = document.getElementById('snsPostTitle');
            const summaryInput = document.getElementById('snsPostSummary');

            if (titleInput) titleInput.value = STATE.lastGeneratedPost.title;
            if (summaryInput) summaryInput.value = STATE.lastGeneratedPost.summary;
        }
    }

    setupEventListeners() {
        const generateBtn = document.getElementById('generateSNSContent');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateContent());
        }

        // 복사 버튼들
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.target;
                this.copyContent(targetId);
            });
        });
    }

    async generateContent() {
        const titleInput = document.getElementById('snsPostTitle');
        const summaryInput = document.getElementById('snsPostSummary');

        const title = titleInput.value.trim();
        const summary = summaryInput.value.trim();

        if (!title) {
            Helpers.showToast('블로그 글 제목을 입력해주세요.', 'warning');
            return;
        }

        if (!summary) {
            Helpers.showToast('글 요약을 입력해주세요.', 'warning');
            return;
        }

        Helpers.showLoading('SNS 문구 생성 중...');

        try {
            const result = await GeminiAPI.generateSNSContent(title, summary);

            if (!result) {
                throw new Error('SNS 문구 생성 실패');
            }

            Helpers.hideLoading();

            this.generatedContent = this.parseContent(result);
            this.displayResults();

            // 히스토리 저장
            Storage.saveToHistory('sns', {
                title,
                summary,
                content: this.generatedContent
            });

            Helpers.showToast('SNS 문구가 생성되었습니다!', 'success');
        } catch (error) {
            Helpers.hideLoading();
            console.error('SNS 문구 생성 오류:', error);
            Helpers.showToast('SNS 문구 생성에 실패했습니다.', 'error');
        }
    }

    parseContent(content) {
        // AI 응답을 파싱하여 플랫폼별로 분리
        const parsed = {
            threads: '',
            instagram: '',
            facebook: ''
        };

        // [Threads/X] 섹션 추출
        const threadsMatch = content.match(/\[Threads\/X\]([\s\S]*?)(?=\[Instagram\]|$)/i);
        if (threadsMatch) {
            parsed.threads = threadsMatch[1].trim();
        }

        // [Instagram] 섹션 추출
        const instagramMatch = content.match(/\[Instagram\]([\s\S]*?)(?=\[Facebook\]|$)/i);
        if (instagramMatch) {
            parsed.instagram = instagramMatch[1].trim();
        }

        // [Facebook] 섹션 추출
        const facebookMatch = content.match(/\[Facebook\]([\s\S]*?)$/i);
        if (facebookMatch) {
            parsed.facebook = facebookMatch[1].trim();
        }

        return parsed;
    }

    displayResults() {
        const resultsArea = document.getElementById('snsResults');
        if (!resultsArea) return;

        // Threads/X 내용
        const threadsContent = document.getElementById('threadsContent');
        if (threadsContent) {
            threadsContent.innerHTML = this.formatContent(this.generatedContent.threads);
        }

        // Instagram 내용
        const instagramContent = document.getElementById('instagramContent');
        if (instagramContent) {
            instagramContent.innerHTML = this.formatContent(this.generatedContent.instagram);
        }

        // Facebook 내용
        const facebookContent = document.getElementById('facebookContent');
        if (facebookContent) {
            facebookContent.innerHTML = this.formatContent(this.generatedContent.facebook);
        }

        resultsArea.style.display = 'block';
        resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    formatContent(text) {
        // 줄바꿈을 <br>로 변환
        return text.replace(/\n/g, '<br>');
    }

    copyContent(targetId) {
        const element = document.getElementById(targetId);
        if (!element) return;

        // HTML을 텍스트로 변환
        const text = element.innerHTML.replace(/<br\s*\/?>/gi, '\n');
        const plainText = Helpers.unescapeHtml(text);

        Helpers.copyToClipboard(plainText);
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.snsMarketing = new SNSMarketing();
});
