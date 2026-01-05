// ===================================
// Google Imagen API 연동
// ===================================

const ImagenAPI = {
    // API 키 확인 (Gemini API 키 사용)
    checkApiKey() {
        if (!CONFIG.apiKeys.gemini) {
            if (window.GeminiAPI) {
                window.GeminiAPI.promptForApiKey();
            }
            // 프롬프트 후 다시 확인
            if (!CONFIG.apiKeys.gemini) {
                Helpers.showToast('Gemini API 키가 필요합니다.', 'error');
                return false;
            }
        }
        return true;
    },

    // 이미지 생성
    async generateImage(prompt, options = {}) {
        if (!this.checkApiKey()) return null;

        try {
            // 프롬프트 개선
            const enhancedPrompt = this.enhancePrompt(prompt, options.style);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${CONFIG.apiKeys.gemini}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        instances: [{
                            prompt: enhancedPrompt
                        }],
                        parameters: {
                            sampleCount: 1,
                            aspectRatio: this.getAspectRatio(options.size),
                            negativePrompt: "low quality, blurry, distorted",
                            safetyFilterLevel: "block_some",
                            personGeneration: "allow_adult"
                        }
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `API 요청 실패: ${response.status}`);
            }

            const data = await response.json();

            if (data.predictions && data.predictions.length > 0) {
                // Base64 이미지를 Data URL로 변환
                const imageData = data.predictions[0].bytesBase64Encoded;
                return {
                    url: `data:image/png;base64,${imageData}`,
                    revisedPrompt: enhancedPrompt
                };
            }

            throw new Error('응답 데이터가 올바르지 않습니다.');
        } catch (error) {
            console.error('Imagen API 오류:', error);
            Helpers.showToast(`이미지 생성 실패: ${error.message}`, 'error');
            return null;
        }
    },

    // 크기를 Aspect Ratio로 변환
    getAspectRatio(size) {
        const ratios = {
            '1024x1024': '1:1',
            '1792x1024': '16:9',
            '1024x1792': '9:16'
        };
        return ratios[size] || '1:1';
    },

    // 프롬프트 개선
    enhancePrompt(prompt, style) {
        const styleEnhancements = {
            realistic: 'photorealistic, high quality, detailed, professional photography',
            illustration: 'digital illustration, artistic, colorful, creative design',
            minimal: 'minimalist design, clean, simple, modern aesthetic',
            artistic: 'artistic style, creative interpretation, expressive, unique',
            cartoon: 'cartoon style, fun, playful, vibrant colors'
        };

        const enhancement = styleEnhancements[style] || styleEnhancements.realistic;

        return `${prompt}, ${enhancement}, high resolution, professional quality`;
    },

    // 블로그용 이미지 생성
    async generateBlogImage(topic, type = 'main') {
        const prompts = {
            main: `Create a featured blog image for an article about "${topic}". The image should be eye-catching, professional, and relevant to the topic.`,
            sub: `Create a supporting image for a blog article section about "${topic}". The image should complement the main content and provide visual context.`
        };

        return await this.generateImage(prompts[type], {
            size: type === 'main' ? '1792x1024' : '1024x1024',
            style: 'realistic'
        });
    },

    // 썸네일용 배경 이미지 생성
    async generateThumbnailBackground(description) {
        const prompt = `Create a background image for a blog thumbnail about "${description}". The image should have space for text overlay, be visually appealing, and not too busy.`;

        return await this.generateImage(prompt, {
            size: '1792x1024',
            style: 'realistic'
        });
    }
};

// 전역으로 내보내기 (하위 호환성을 위해 DalleAPI도 유지)
window.ImagenAPI = ImagenAPI;
window.DalleAPI = ImagenAPI; // 기존 코드 호환성

