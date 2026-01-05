// ===================================
// 애플리케이션 설정
// ===================================

const CONFIG = {
    // API 엔드포인트
    api: {
        gemini: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent',
        dalle: 'https://api.openai.com/v1/images/generations',
        naverSearch: 'https://openapi.naver.com/v1/search/blog.json'
    },

    // API 키 (보안을 위해 비워둠. UI에서 입력 가능)
    apiKeys: {
        gemini: '',
        openai: '',
        naverId: '',
        naverSecret: ''
    },

    // 컬러 테마
    themes: {
        purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        blue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        green: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        sunset: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
        ocean: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)'
    },

    // 카테고리
    categories: [
        { value: 'it', label: 'IT/테크' },
        { value: 'health', label: '건강/웰빙' },
        { value: 'finance', label: '재테크/금융' },
        { value: 'lifestyle', label: '라이프스타일' },
        { value: 'food', label: '요리/맛집' },
        { value: 'travel', label: '여행' },
        { value: 'education', label: '교육/학습' },
        { value: 'business', label: '비즈니스/창업' }
    ],

    // 이미지 스타일
    imageStyles: [
        { value: 'realistic', label: '사실적' },
        { value: 'illustration', label: '일러스트' },
        { value: 'minimal', label: '미니멀' },
        { value: 'artistic', label: '예술적' },
        { value: 'cartoon', label: '카툰' }
    ],

    // 이미지 크기
    imageSizes: [
        { value: '1024x1024', label: '정사각형 (1024x1024)' },
        { value: '1792x1024', label: '가로형 (1792x1024)' },
        { value: '1024x1792', label: '세로형 (1024x1792)' }
    ],

    // 썸네일 비율
    thumbnailRatios: {
        '16:9': { width: 1920, height: 1080 },
        '1:1': { width: 1080, height: 1080 },
        '4:3': { width: 1440, height: 1080 }
    },

    // 글쓰기 스타일
    writingStyles: {
        friendly: {
            name: '친근형',
            description: '감정 표현, 개인적 경험, 대화체',
            prompt: '친근하고 대화하듯이 작성하세요. 개인적인 경험과 감정을 표현하고, 독자와 소통하는 느낌으로 작성합니다.'
        },
        expert: {
            name: '전문가형',
            description: '논리적 구조, 고급 어휘, 신뢰감',
            prompt: '전문적이고 신뢰감 있게 작성하세요. 논리적인 구조와 고급 어휘를 사용하며, 객관적이고 권위 있는 톤을 유지합니다.'
        }
    },

    // 로컬 스토리지 키
    storageKeys: {
        apiKeys: 'blogging_pro_api_keys',
        theme: 'blogging_pro_theme',
        history: 'blogging_pro_history',
        settings: 'blogging_pro_settings'
    }
};

// 전역 상태
const STATE = {
    currentTheme: 'light',
    selectedColorTheme: 'purple',
    selectedWritingStyle: 'friendly',
    currentTab: 'topic-generator',
    generatedTopics: [],
    keywordAnalysis: null,
    generatedPost: null,
    generatedImages: [],
    snsContent: null
};

// CONFIG를 전역으로 내보내기
window.CONFIG = CONFIG;
window.STATE = STATE;
