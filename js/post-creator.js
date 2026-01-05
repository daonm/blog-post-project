// ===================================
// 포스트 생성 모듈
// ===================================

class PostCreator {
    constructor() {
        this.generatedPost = null;
        this.generatedTags = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const generateBtn = document.getElementById('generatePost');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generatePost());
        }

        const copyHTMLBtn = document.getElementById('copyHTML');
        if (copyHTMLBtn) {
            copyHTMLBtn.addEventListener('click', () => this.copyHTML());
        }

        const copyInteractiveBtn = document.getElementById('copyInteractive');
        if (copyInteractiveBtn) {
            copyInteractiveBtn.addEventListener('click', () => this.copyInteractiveCode());
        }

        const previewBtn = document.getElementById('previewPost');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.togglePreview());
        }
    }

    async generatePost() {
        const title = document.getElementById('postTitle').value.trim();

        if (!title) {
            Helpers.showToast('제목을 입력해주세요.', 'warning');
            return;
        }

        const additionalRequests = document.getElementById('additionalRequests').value.trim();
        const generateMainImage = document.getElementById('generateMainImage').checked;
        const generateSubImages = document.getElementById('generateSubImages').checked;
        const addInteractive = document.getElementById('addInteractive').checked;

        const options = {
            additionalRequests,
            includeImages: generateMainImage || generateSubImages,
            includeInteractive: addInteractive
        };

        Helpers.showLoading('포스트 생성 중... (최대 1분 소요)');

        try {
            // 포스트 생성
            const postHTML = await GeminiAPI.generatePost(title, STATE.selectedWritingStyle, options);

            if (!postHTML) {
                throw new Error('포스트 생성 실패');
            }

            this.generatedPost = postHTML;

            // 태그 생성 임시 비활성화 (MAX_TOKENS 문제로 인해)
            // const tags = await GeminiAPI.generateTags(postHTML);
            // if (tags) {
            //     this.generatedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            // }

            Helpers.hideLoading();

            // 결과 표시
            this.displayResults();

            // 히스토리 저장
            Storage.saveToHistory('post', {
                title,
                style: STATE.selectedWritingStyle,
                content: postHTML,
                tags: this.generatedTags
            });

            // SNS 탭으로 데이터 전달 (STATE에 저장)
            const textContent = postHTML.replace(/<[^>]+>/g, ''); // HTML 태그 제거
            const summary = textContent.substring(0, 200) + '...'; // 처음 200자를 요약으로 사용

            STATE.lastGeneratedPost = {
                title: title,
                summary: summary,
                fullContent: postHTML
            };

            Helpers.showToast('포스트가 생성되었습니다!', 'success');
        } catch (error) {
            Helpers.hideLoading();
            console.error('포스트 생성 오류:', error);
            Helpers.showToast('포스트 생성에 실패했습니다.', 'error');
        }
    }

    displayResults() {
        const resultsArea = document.getElementById('postResults');
        const previewArea = document.getElementById('postPreview');
        const tagsArea = document.getElementById('recommendedTags');

        // HTML 미리보기
        previewArea.innerHTML = this.generatedPost;

        // 태그 표시
        if (tagsArea && this.generatedTags.length > 0) {
            let tagsHTML = '';
            this.generatedTags.forEach(tag => {
                tagsHTML += `<span class="tag">${tag}</span>`;
            });
            tagsArea.innerHTML = tagsHTML;
        }

        resultsArea.style.display = 'block';
        resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    copyHTML() {
        if (!this.generatedPost) {
            Helpers.showToast('먼저 포스트를 생성해주세요.', 'warning');
            return;
        }

        Helpers.copyToClipboard(this.generatedPost);
    }

    copyInteractiveCode() {
        if (!this.generatedPost) {
            Helpers.showToast('먼저 포스트를 생성해주세요.', 'warning');
            return;
        }

        // 인터랙티브 코드 추출 (간단한 버전)
        const scriptMatch = this.generatedPost.match(/<script[\s\S]*?<\/script>/gi);

        if (scriptMatch && scriptMatch.length > 0) {
            const interactiveCode = scriptMatch.join('\n\n');
            const wrappedCode = `<!-- INTERACTIVE_CODE_START -->\n${interactiveCode}\n<!-- INTERACTIVE_CODE_END -->`;
            Helpers.copyToClipboard(wrappedCode);
        } else {
            Helpers.showToast('인터랙티브 코드가 없습니다.', 'info');
        }
    }

    togglePreview() {
        const previewArea = document.getElementById('postPreview');
        if (!previewArea) return;

        if (previewArea.style.display === 'none') {
            previewArea.style.display = 'block';
        } else {
            previewArea.style.display = 'none';
        }
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.postCreator = new PostCreator();
});
