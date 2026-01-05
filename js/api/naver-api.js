// ===================================
// Naver Search API 연동
// ===================================

const NaverAPI = {
    // API 키 확인
    checkApiKey() {
        if (!CONFIG.apiKeys.naverId || !CONFIG.apiKeys.naverSecret) {
            this.promptForApiKey();
            // 프롬프트 후 다시 확인
            if (!CONFIG.apiKeys.naverId || !CONFIG.apiKeys.naverSecret) {
                Helpers.showToast('네이버 API 키가 필요합니다.', 'error');
                return false;
            }
        }
        return true;
    },

    // API 키 입력 프롬프트
    promptForApiKey() {
        const clientId = prompt('네이버 API Client ID를 입력하세요:\n\n(네이버 개발자 센터에서 발급받을 수 있습니다)\nhttps://developers.naver.com/apps/#/register');
        if (!clientId) return;

        const clientSecret = prompt('네이버 API Client Secret을 입력하세요:');
        if (!clientSecret) return;

        Storage.saveApiKeys({
            naverId: clientId,
            naverSecret: clientSecret
        });
        Helpers.showToast('API 키가 저장되었습니다!', 'success');
    },

    // 키워드 검색
    async searchKeyword(keyword) {
        if (!this.checkApiKey()) return null;

        try {
            // 실제 API 호출
            const response = await fetch(
                `${CONFIG.api.naverSearch}?query=${encodeURIComponent(keyword)}&display=10&start=1&sort=sim`,
                {
                    headers: {
                        'X-Naver-Client-Id': CONFIG.apiKeys.naverId,
                        'X-Naver-Client-Secret': CONFIG.apiKeys.naverSecret
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 401) throw new Error('네이버 API 키가 올바르지 않습니다.');
                if (response.status === 403) throw new Error('네이버 API 권한이 없거나 CORS 오류가 발생했습니다.');
                throw new Error(`API 요청 실패: ${response.status}`);
            }

            const data = await response.json();
            return this.analyzeSearchResults(keyword, data);
        } catch (error) {
            console.error('Naver API 오류:', error);

            // CORS 오류 또는 네트워크 오류인 경우 데모 데이터로 폴백
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS') || error.message.includes('403')) {
                console.warn('⚠️ CORS 보안 정책으로 인해 실제 데이터를 가져올 수 없습니다. 데모 데이터로 전환합니다.');
                Helpers.showToast('CORS 보안 정책으로 인해 실제 데이터를 가져올 수 없어 데모 데이터로 전환합니다. (확장 프로그램 사용 권장)', 'warning', 5000);
                return this.generateDemoAnalysis(keyword);
            } else {
                Helpers.showToast(`키워드 분석 실패: ${error.message}`, 'error');
                return null;
            }
        }
    },

    // 검색 결과 분석
    analyzeSearchResults(keyword, data) {
        const total = data.total || 0;

        // 경쟁도 계산 (간단한 버전)
        let competition = '낮음';
        if (total > 100000) competition = '높음';
        else if (total > 10000) competition = '중간';

        // 추천 점수 계산
        let score = 70;
        if (total < 10000) score += 20;
        else if (total > 100000) score -= 20;

        // 연관 키워드 추출 (제목에서)
        const relatedKeywords = this.extractRelatedKeywords(data.items, keyword);

        // SEO 전략 생성
        const strategy = this.generateSEOStrategy(keyword, competition, total);

        return {
            keyword,
            monthlySearches: this.estimateMonthlySearches(total),
            competition,
            score: Math.max(0, Math.min(100, score)),
            relatedKeywords,
            strategy,
            rawData: data
        };
    },

    // 월간 검색량 추정
    estimateMonthlySearches(total) {
        // 실제로는 네이버 광고 API를 사용해야 하지만, 여기서는 추정값 사용
        if (total > 100000) return '10,000+';
        if (total > 50000) return '5,000 - 10,000';
        if (total > 10000) return '1,000 - 5,000';
        if (total > 1000) return '100 - 1,000';
        return '< 100';
    },

    // 연관 키워드 추출
    extractRelatedKeywords(items, mainKeyword) {
        const keywords = new Set();

        items.forEach(item => {
            const title = item.title.replace(/<[^>]*>/g, ''); // HTML 태그 제거
            const words = title.split(/\s+/);

            words.forEach(word => {
                if (word.length > 1 && word !== mainKeyword && !keywords.has(word)) {
                    keywords.add(word);
                }
            });
        });

        return Array.from(keywords).slice(0, 10);
    },

    // SEO 전략 생성
    generateSEOStrategy(keyword, competition, total) {
        let strategy = `<h4>SEO 전략 제안</h4>`;

        if (competition === '낮음') {
            strategy += `
                <p><strong>✅ 좋은 기회!</strong> 경쟁이 낮은 키워드입니다.</p>
                <ul>
                    <li>롱테일 키워드로 활용하기 좋습니다</li>
                    <li>상위 노출 가능성이 높습니다</li>
                    <li>관련 키워드와 함께 사용하면 효과적입니다</li>
                </ul>
            `;
        } else if (competition === '중간') {
            strategy += `
                <p><strong>⚠️ 적당한 경쟁</strong> 전략적 접근이 필요합니다.</p>
                <ul>
                    <li>고품질 콘텐츠로 차별화하세요</li>
                    <li>E-EAT 요소를 강화하세요</li>
                    <li>내부 링크 구조를 최적화하세요</li>
                </ul>
            `;
        } else {
            strategy += `
                <p><strong>🔥 높은 경쟁</strong> 신중한 전략이 필요합니다.</p>
                <ul>
                    <li>롱테일 키워드로 세분화하세요</li>
                    <li>독특한 관점과 깊이 있는 내용을 제공하세요</li>
                    <li>지속적인 콘텐츠 업데이트가 필요합니다</li>
                </ul>
            `;
        }

        return strategy;
    },

    // 데모 분석 데이터 생성
    generateDemoAnalysis(keyword) {
        // 랜덤 데이터 생성 (실제 API 연동 전 테스트용)
        const total = Math.floor(Math.random() * 150000);
        const competition = total > 100000 ? '높음' : total > 10000 ? '중간' : '낮음';
        const score = Math.floor(Math.random() * 40) + 60;

        const relatedKeywords = [
            `${keyword} 방법`,
            `${keyword} 추천`,
            `${keyword} 가이드`,
            `${keyword} 팁`,
            `${keyword} 정보`,
            `${keyword} 비교`,
            `${keyword} 순위`,
            `${keyword} 리뷰`
        ].slice(0, 5);

        return {
            keyword,
            monthlySearches: this.estimateMonthlySearches(total),
            competition,
            score,
            relatedKeywords,
            strategy: this.generateSEOStrategy(keyword, competition, total),
            isDemo: true
        };
    }
};

// 전역으로 내보내기
window.NaverAPI = NaverAPI;
