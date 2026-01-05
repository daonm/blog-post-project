// ===================================
// 썸네일 제작 모듈
// ===================================

class ThumbnailMaker {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.backgroundImage = null;
        this.init();
    }

    init() {
        this.canvas = document.getElementById('thumbnailCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();
        }
        this.setupEventListeners();
    }

    setupCanvas() {
        // 기본 캔버스 크기 설정 (16:9)
        this.canvas.width = 1920;
        this.canvas.height = 1080;
        this.drawPlaceholder();
    }

    setupEventListeners() {
        // 배경 이미지 업로드
        const bgImageInput = document.getElementById('thumbnailBgImage');
        if (bgImageInput) {
            bgImageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // 생성된 이미지 사용
        const useGeneratedBtn = document.getElementById('useGeneratedImage');
        if (useGeneratedBtn) {
            useGeneratedBtn.addEventListener('click', () => this.useGeneratedImage());
        }

        // 텍스트 입력
        const textInput = document.getElementById('thumbnailText');
        if (textInput) {
            textInput.addEventListener('input', () => this.updateCanvas());
        }

        // 글꼴 선택
        const fontSelect = document.getElementById('thumbnailFont');
        if (fontSelect) {
            fontSelect.addEventListener('change', () => this.updateCanvas());
        }

        // 색상 선택
        const textColorInput = document.getElementById('thumbnailTextColor');
        const strokeColorInput = document.getElementById('thumbnailStrokeColor');
        if (textColorInput) textColorInput.addEventListener('change', () => this.updateCanvas());
        if (strokeColorInput) strokeColorInput.addEventListener('change', () => this.updateCanvas());

        // 크기 조절
        const fontSizeInput = document.getElementById('thumbnailFontSize');
        const strokeWidthInput = document.getElementById('thumbnailStrokeWidth');
        if (fontSizeInput) {
            fontSizeInput.addEventListener('input', (e) => {
                document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
                this.updateCanvas();
            });
        }
        if (strokeWidthInput) {
            strokeWidthInput.addEventListener('input', (e) => {
                document.getElementById('strokeWidthValue').textContent = e.target.value + 'px';
                this.updateCanvas();
            });
        }

        // 비율 선택
        const ratioSelect = document.getElementById('thumbnailRatio');
        if (ratioSelect) {
            ratioSelect.addEventListener('change', () => this.changeRatio());
        }

        // 다운로드
        const downloadBtn = document.getElementById('downloadThumbnail');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadThumbnail());
        }
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const dataUrl = await Helpers.readFile(file);
            await this.loadImageFromUrl(dataUrl);
        } catch (error) {
            console.error('이미지 로드 오류:', error);
            Helpers.showToast('이미지를 로드할 수 없습니다.', 'error');
        }
    }

    async loadImageFromUrl(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                this.backgroundImage = img;
                this.updateCanvas();
                resolve();
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    useGeneratedImage() {
        if (window.imageGenerator && window.imageGenerator.generatedImages.length > 0) {
            const lastImage = window.imageGenerator.generatedImages[window.imageGenerator.generatedImages.length - 1];
            this.loadImageFromUrl(lastImage.url);
        } else {
            Helpers.showToast('먼저 이미지를 생성해주세요.', 'warning');
        }
    }

    changeRatio() {
        const ratioSelect = document.getElementById('thumbnailRatio');
        const ratio = ratioSelect.value;
        const dimensions = CONFIG.thumbnailRatios[ratio];

        if (dimensions) {
            this.canvas.width = dimensions.width;
            this.canvas.height = dimensions.height;
            this.updateCanvas();
        }
    }

    drawPlaceholder() {
        this.ctx.fillStyle = '#334155';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '48px "Noto Sans KR"';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('배경 이미지를 업로드하세요', this.canvas.width / 2, this.canvas.height / 2);
    }

    updateCanvas() {
        // 캔버스 초기화
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 배경 이미지 그리기
        if (this.backgroundImage) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.drawPlaceholder();
            return;
        }

        // 텍스트 가져오기
        const textInput = document.getElementById('thumbnailText');
        const text = textInput ? textInput.value : '';

        if (!text) return;

        // 줄바꿈 처리
        const lines = text.split('/').map(line => line.trim());

        // 스타일 가져오기
        const font = document.getElementById('thumbnailFont').value;
        const fontSize = parseInt(document.getElementById('thumbnailFontSize').value);
        const textColor = document.getElementById('thumbnailTextColor').value;
        const strokeColor = document.getElementById('thumbnailStrokeColor').value;
        const strokeWidth = parseInt(document.getElementById('thumbnailStrokeWidth').value);

        // 텍스트 그리기
        this.ctx.font = `bold ${fontSize}px "${font}"`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const lineHeight = fontSize * 1.3;
        const totalHeight = lines.length * lineHeight;
        const startY = (this.canvas.height - totalHeight) / 2 + fontSize / 2;

        lines.forEach((line, index) => {
            const y = startY + index * lineHeight;

            // 외곽선
            if (strokeWidth > 0) {
                this.ctx.strokeStyle = strokeColor;
                this.ctx.lineWidth = strokeWidth;
                this.ctx.strokeText(line, this.canvas.width / 2, y);
            }

            // 텍스트
            this.ctx.fillStyle = textColor;
            this.ctx.fillText(line, this.canvas.width / 2, y);
        });
    }

    downloadThumbnail() {
        if (!this.backgroundImage) {
            Helpers.showToast('먼저 배경 이미지를 업로드하세요.', 'warning');
            return;
        }

        const dataUrl = this.canvas.toDataURL('image/png', 1.0);
        Helpers.downloadImage(dataUrl, `thumbnail-${Date.now()}.png`);
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.thumbnailMaker = new ThumbnailMaker();
});
