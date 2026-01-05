// ===================================
// Gemini API 연동
// ===================================

const GeminiAPI = {
    // API 키 확인
    checkApiKey() {
        if (!CONFIG.apiKeys.gemini) {
            this.promptForApiKey();
            // 프롬프트 후 다시 확인
            if (!CONFIG.apiKeys.gemini) {
                Helpers.showToast('Gemini API 키가 필요합니다.', 'error');
                return false;
            }
        }
        return true;
    },

    // API 키 입력 프롬프트
    promptForApiKey() {
        const apiKey = prompt('Gemini API 키를 입력하세요:\n\n(Google AI Studio에서 발급받을 수 있습니다)\nhttps://makersuite.google.com/app/apikey');
        if (apiKey) {
            Storage.saveApiKeys({ gemini: apiKey });
            Helpers.showToast('API 키가 저장되었습니다!', 'success');
        }
    },

    // 텍스트 생성
    async generateText(prompt, options = {}) {
        if (!this.checkApiKey()) return null;

        console.log('=== Gemini API 호출 시작 ===');
        console.log('API 키:', CONFIG.apiKeys.gemini ? '설정됨' : '없음');
        console.log('엔드포인트:', CONFIG.api.gemini);

        try {
            const response = await fetch(
                `${CONFIG.api.gemini}?key=${CONFIG.apiKeys.gemini}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }],
                        generationConfig: {
                            temperature: options.temperature || 0.7,
                            topK: options.topK || 40,
                            topP: options.topP || 0.95,
                            maxOutputTokens: options.maxTokens || 8192, // 2048에서 8192로 증가
                        }
                    })
                }
            );

            console.log('응답 상태:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API 오류 응답:', errorData);
                throw new Error(`API 요청 실패: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            console.log('응답 데이터:', data);

            if (data.candidates && data.candidates.length > 0) {
                const candidate = data.candidates[0];

                // MAX_TOKENS로 잘린 경우에도 처리
                if (candidate.finishReason === 'MAX_TOKENS') {
                    console.warn('⚠️ 응답이 MAX_TOKENS로 잘렸습니다. 부분 응답을 반환합니다.');
                }

                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                    console.log('=== API 호출 성공 ===');
                    return candidate.content.parts[0].text;
                }

                // parts가 없지만 content가 있는 경우 (일부 응답 형식)
                if (candidate.content && candidate.content.text) {
                    console.log('=== API 호출 성공 (대체 형식) ===');
                    return candidate.content.text;
                }
            }

            console.error('응답 구조 오류:', JSON.stringify(data, null, 2));
            throw new Error('응답 데이터가 올바르지 않습니다.');
        } catch (error) {
            console.error('=== Gemini API 오류 ===');
            console.error('오류 상세:', error);
            Helpers.showToast(`텍스트 생성 실패: ${error.message}`, 'error');
            return null;
        }
    },

    // 주제 생성 프롬프트
    async generateTopics(type, input) {
        const prompts = {
            category: `당신은 블로그 주제 전문가입니다. "${input}" 카테고리에 대한 블로그 주제 5개를 추천해주세요.
            
요구사항:
- 최신 트렌드를 반영한 주제
- 검색 수요가 있는 주제
- 독자의 관심을 끌 수 있는 주제
- 각 주제는 구체적이고 명확해야 함

다음 형식으로 응답해주세요:
1. [주제 제목] - [간단한 설명]
2. [주제 제목] - [간단한 설명]
...`,

            eeat: `당신은 SEO 전문가입니다. "${input}" 분야에서 E-EAT(경험, 전문성, 권위성, 신뢰성)을 충족하는 심층 블로그 주제 5개를 추천해주세요.
            
요구사항:
- 전문성을 보여줄 수 있는 주제
- 깊이 있는 분석이 가능한 주제
- 권위 있는 정보를 제공할 수 있는 주제
- 독자에게 실질적인 가치를 제공하는 주제

다음 형식으로 응답해주세요:
1. [주제 제목] - [간단한 설명]
2. [주제 제목] - [간단한 설명]
...`,

            evergreen: `당신은 콘텐츠 전략가입니다. "${input}" 주제와 관련하여 시간이 지나도 가치가 변하지 않는 에버그린 콘텐츠 주제 5개를 추천해주세요.
            
요구사항:
- 시간이 지나도 유효한 정보
- 기초적이고 본질적인 내용
- 지속적인 검색 수요가 있는 주제
- 초보자도 이해하기 쉬운 주제

다음 형식으로 응답해주세요:
1. [주제 제목] - [간단한 설명]
2. [주제 제목] - [간단한 설명]
...`,

            longtail: `당신은 키워드 분석 전문가입니다. "${input}" 키워드와 관련된 롱테일 키워드 기반 블로그 주제 5개를 추천해주세요.
            
요구사항:
- 경쟁이 낮은 세부 주제
- 검색 의도가 명확한 주제
- 구체적이고 타겟팅된 주제
- 실제 검색할 법한 질문 형태

다음 형식으로 응답해주세요:
1. [주제 제목] - [간단한 설명]
2. [주제 제목] - [간단한 설명]
...`,

            memo: `당신은 콘텐츠 큐레이터입니다. 다음 메모/자료를 분석하여 블로그 글로 재구성할 수 있는 주제 5개를 추천해주세요.

메모/자료:
${input}

요구사항:
- 메모의 핵심 내용을 파악
- 블로그 독자에게 유용한 형태로 재구성
- 각 주제는 독립적인 글이 될 수 있어야 함
- 실용적이고 가치 있는 주제

다음 형식으로 응답해주세요:
1. [주제 제목] - [간단한 설명]
2. [주제 제목] - [간단한 설명]
...`
        };

        const topicPrompt = prompts[type];
        if (!topicPrompt) {
            Helpers.showToast('올바르지 않은 주제 유형입니다.', 'error');
            return null;
        }

        return await this.generateText(topicPrompt);
    },

    // 블로그 포스트 생성 프롬프트
    async generatePost(title, style, options = {}) {
        const stylePrompt = CONFIG.writingStyles[style].prompt;

        let prompt = `주제: ${title}

스타일: ${stylePrompt}

요구사항:
- 800-1000자 분량
- 서론, 본론, 결론 구조
- 실용적인 정보 제공
- HTML 형식 (<article> 태그 사용)`;

        if (options.additionalRequests) {
            prompt += `\n\n추가: ${options.additionalRequests}`;
        }

        return await this.generateText(prompt, { maxTokens: 4096 });
    },

    // SNS 홍보 문구 생성
    async generateSNSContent(title, summary) {
        const snsPrompt = `당신은 소셜 미디어 마케팅 전문가입니다. 다음 블로그 글에 대한 플랫폼별 홍보 문구를 작성해주세요.

블로그 제목: ${title}
글 요약: ${summary}

다음 형식으로 각 플랫폼에 맞는 문구를 작성해주세요:

[Threads/X]
(짧고 임팩트 있는 문구, 최대 280자)

[Instagram]
(감성적인 표현과 해시태그 포함, 이모지 활용)

[Facebook]
(요약 및 공유 유도 문구, 친근한 톤)`;

        return await this.generateText(snsPrompt);
    },

    // 태그 생성
    async generateTags(content) {
        const tagPrompt = `다음 블로그 글의 내용을 분석하여 적절한 태그 10개를 추천해주세요.

내용:
${content.substring(0, 1000)}...

요구사항:
- 글의 핵심 키워드 포함
- SEO에 유리한 태그
- 검색 가능성이 높은 태그
- 쉼표로 구분하여 나열

태그:`;

        return await this.generateText(tagPrompt, { maxTokens: 200 });
    }
};

// 전역으로 내보내기
window.GeminiAPI = GeminiAPI;
