// ===================================
// 헬퍼 함수
// ===================================

const Helpers = {
    // 로딩 오버레이 표시
    showLoading(text = '생성 중...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = overlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
        overlay.classList.add('active');
    },

    // 로딩 오버레이 숨기기
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('active');
    },

    // 클립보드에 복사
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('클립보드에 복사되었습니다!', 'success');
            return true;
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
            // 폴백: 구식 방법 사용
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                this.showToast('클립보드에 복사되었습니다!', 'success');
                return true;
            } catch (err) {
                this.showToast('복사에 실패했습니다.', 'error');
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    },

    // 토스트 메시지 표시
    showToast(message, type = 'info') {
        // 기존 토스트 제거
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // 날짜 포맷팅
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    // 텍스트 줄바꿈 처리
    processLineBreaks(text, separator = '/') {
        return text.split(separator).map(line => line.trim()).join('\n');
    },

    // HTML 이스케이프
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // HTML 언이스케이프
    unescapeHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent;
    },

    // 파일 읽기
    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);

            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        });
    },

    // 이미지 다운로드
    downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast('이미지가 다운로드되었습니다!', 'success');
    },

    // 텍스트 파일 다운로드
    downloadText(text, filename) {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.showToast('파일이 다운로드되었습니다!', 'success');
    },

    // 디바운스
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 쓰로틀
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 랜덤 ID 생성
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 텍스트 요약
    summarizeText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    // 해시태그 추출
    extractHashtags(text) {
        const regex = /#[\w가-힣]+/g;
        const matches = text.match(regex);
        return matches ? matches.map(tag => tag.slice(1)) : [];
    },

    // 키워드 추출 (간단한 버전)
    extractKeywords(text, count = 5) {
        // 한글, 영문, 숫자만 추출
        const words = text.match(/[\w가-힣]+/g) || [];

        // 불용어 제거 (간단한 버전)
        const stopWords = ['이', '그', '저', '것', '수', '등', '및', 'the', 'a', 'an', 'and', 'or', 'but'];
        const filtered = words.filter(word =>
            word.length > 1 && !stopWords.includes(word.toLowerCase())
        );

        // 빈도수 계산
        const frequency = {};
        filtered.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        // 빈도수 기준 정렬
        const sorted = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([word]) => word);

        return sorted;
    },

    // 이미지 URL을 Base64로 변환
    async imageUrlToBase64(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('이미지 변환 실패:', error);
            return null;
        }
    },

    // 캔버스를 이미지로 변환
    canvasToImage(canvas, format = 'image/png', quality = 0.95) {
        return canvas.toDataURL(format, quality);
    },

    // 색상 밝기 계산
    getColorBrightness(hex) {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        return (r * 299 + g * 587 + b * 114) / 1000;
    },

    // 대비되는 텍스트 색상 반환
    getContrastColor(hex) {
        return this.getColorBrightness(hex) > 128 ? '#000000' : '#ffffff';
    }
};

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 전역으로 내보내기
window.Helpers = Helpers;
