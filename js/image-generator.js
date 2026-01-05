// ===================================
// 이미지 생성 모듈
// ===================================

class ImageGenerator {
    constructor() {
        this.generatedImages = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const generateBtn = document.getElementById('generateImage');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateImage());
        }
    }

    async generateImage() {
        const promptInput = document.getElementById('imagePrompt');
        const styleSelect = document.getElementById('imageStyle');
        const sizeSelect = document.getElementById('imageSize');

        const prompt = promptInput.value.trim();

        if (!prompt) {
            Helpers.showToast('이미지 프롬프트를 입력해주세요.', 'warning');
            return;
        }

        const style = styleSelect.value;
        const size = sizeSelect.value;

        Helpers.showLoading('이미지 생성 중... (최대 30초 소요)');

        try {
            const result = await DalleAPI.generateImage(prompt, { style, size });

            if (!result) {
                throw new Error('이미지 생성 실패');
            }

            Helpers.hideLoading();

            // 이미지 저장
            this.generatedImages.push({
                url: result.url,
                prompt: prompt,
                revisedPrompt: result.revisedPrompt,
                timestamp: new Date().toISOString()
            });

            // 갤러리에 추가
            this.addToGallery(result);

            // 히스토리 저장
            Storage.saveToHistory('image', {
                prompt,
                style,
                size,
                url: result.url
            });

            Helpers.showToast('이미지가 생성되었습니다!', 'success');
        } catch (error) {
            Helpers.hideLoading();
            console.error('이미지 생성 오류:', error);
            Helpers.showToast('이미지 생성에 실패했습니다.', 'error');
        }
    }

    addToGallery(imageData) {
        const gallery = document.getElementById('imageGallery');
        if (!gallery) return;

        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${imageData.url}" alt="${imageData.revisedPrompt || '생성된 이미지'}">
            <div class="image-actions">
                <button class="btn btn-secondary btn-sm" onclick="window.imageGenerator.downloadImage('${imageData.url}')">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    다운로드
                </button>
                <button class="btn btn-secondary btn-sm" onclick="window.imageGenerator.useForThumbnail('${imageData.url}')">
                    썸네일 사용
                </button>
            </div>
        `;

        gallery.insertBefore(imageItem, gallery.firstChild);
    }

    async downloadImage(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `blog-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(blobUrl);
            Helpers.showToast('이미지가 다운로드되었습니다!', 'success');
        } catch (error) {
            console.error('다운로드 오류:', error);
            Helpers.showToast('다운로드에 실패했습니다.', 'error');
        }
    }

    useForThumbnail(url) {
        // 썸네일 제작 탭으로 전환
        window.app.switchSubTab('thumbnail-maker');

        // 썸네일 메이커에 이미지 전달
        if (window.thumbnailMaker) {
            window.thumbnailMaker.loadImageFromUrl(url);
        }

        Helpers.showToast('썸네일 제작 탭으로 이동했습니다!', 'success');
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.imageGenerator = new ImageGenerator();
});
