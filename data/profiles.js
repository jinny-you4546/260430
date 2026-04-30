/**
 * data/profiles.js — UserProfile 샘플 5개
 *
 * 사용 목적: 테스트 케이스 입력값, 온보딩 데모 데이터
 * React 전환: src/data/sampleProfiles.ts
 *
 * UserProfile 스키마
 * ─────────────────────────────────────────────────────
 * id                string
 * name              string
 * age               number          만 나이
 * region            string          시도
 * employmentStatus  'employed' | 'unemployed' | 'freelance' | 'student' | 'other'
 * employerType      'sme' | 'large' | 'public' | 'startup' | null
 * incomeLevel       'level1'~'level6'  (중위소득 50/60/100/120/150/180%)
 * educationLevel    'highschool' | 'university' | 'graduate' | 'dropout'
 * householdType     'single' | 'multi'
 * isHomeless        boolean | null
 * createdAt         ISO8601
 */

var SAMPLE_PROFILES = {

  /**
   * 서울 미취업 졸업자
   * 대학 졸업 후 취업 준비 중. 1인 가구로 독립 거주.
   * 기대 매칭:
   *   URGENT  — p003 (청년 월세 D-2), p013 (서울 공공전세 D-11)
   *   HIGH    — p004 (취업성공패키지), p009 (구직지원금), p011 (서울청년수당 D-21), p014 (두드림)
   *   AGENCY  — p005 (국민취업지원제도 — 유형 복잡), p015 (전역 — complex, 복잡 조건)
   *   INELIG  — p001 (취업 상태 불일치), p006 (취업 상태 불일치), p010 (학력·취업 불일치), p012 (취업 불일치)
   */
  seoulUnemployed: {
    id: 'profile_001',
    name: '김지원',
    age: 27,
    region: '서울',
    employmentStatus: 'unemployed',
    employerType: null,
    incomeLevel: 'level3',
    educationLevel: 'university',
    householdType: 'single',
    isHomeless: true,
    createdAt: '2026-04-29T09:00:00Z',
  },

  /**
   * 서울 재학생
   * 4년제 대학 재학 중. 부모와 함께 거주 (무주택 아님).
   * 기대 매칭:
   *   HIGH    — p010 (국가장학금), p011 (서울청년수당 — student 허용)
   *   CHECK   — p007 (버팀목 전세 — isHomeless null 아닌 false이므로 INELIG)
   *   INELIG  — p001 (취업 불일치), p003 (무주택 불일치), p004 (취업 불일치), p006 (취업 불일치)
   */
  seoulStudent: {
    id: 'profile_002',
    name: '이수빈',
    age: 22,
    region: '서울',
    employmentStatus: 'student',
    employerType: null,
    incomeLevel: 'level2',
    educationLevel: 'university',
    householdType: 'multi',
    isHomeless: false,
    createdAt: '2026-04-29T09:00:00Z',
  },

  /**
   * 경기 미취업 청년
   * 고졸 후 취업 준비 중. 1인 가구, 무주택.
   * 서울 전용 정책(p011~p014)은 전부 INELIG.
   * 기대 매칭:
   *   URGENT  — p003 (월세 D-2), p008 (창업사관학교 D-1 — student 포함이라 unemployed도 해당)
   *   HIGH    — p004 (취업성공패키지), p009 (구직지원금)
   *   AGENCY  — p005 (국민취업지원제도 — 유형 복잡)
   *   INELIG  — p011, p012, p013, p014 (지역 불일치)
   */
  gyeonggiUnemployed: {
    id: 'profile_003',
    name: '박민준',
    age: 25,
    region: '경기',
    employmentStatus: 'unemployed',
    employerType: null,
    incomeLevel: 'level2',
    educationLevel: 'highschool',
    householdType: 'single',
    isHomeless: true,
    createdAt: '2026-04-29T09:00:00Z',
  },

  /**
   * 서울 제대군인
   * 최근 전역 후 구직 중. 가족과 거주 (무주택 여부 불명).
   * p015 (전역 지원) 는 complex 조건 → AGENCY
   * 기대 매칭:
   *   URGENT  — p003 (월세 D-2 — isHomeless null이라 CHECK)
   *   CHECK   — p003, p007, p013 (isHomeless null)
   *   AGENCY  — p005 (국민취업지원제도), p015 (전역 지원 — complex)
   *   HIGH    — p004 (취업성공패키지), p009 (구직지원금), p011 (서울청년수당)
   *   INELIG  — p001, p002, p006, p010, p012 (취업 상태·학력 불일치)
   */
  seoulVeteran: {
    id: 'profile_004',
    name: '최재현',
    age: 25,
    region: '서울',
    employmentStatus: 'unemployed',
    employerType: null,
    incomeLevel: 'level2',
    educationLevel: 'highschool',
    householdType: 'multi',
    isHomeless: null,          // 전역 직후 — 주거 상황 불명
    createdAt: '2026-04-29T09:00:00Z',
  },

  /**
   * 서울 재직자 (중소기업)
   * 중소기업 2년차 직장인. 1인 가구, 무주택.
   * 기대 매칭:
   *   HIGH    — p002 (청년도약계좌), p007 (버팀목 대출), p012 (희망두배 — income level3 > level2 → INELIG)
   *   AGENCY  — p006 (청년내일채움공제 — complex: 중소기업 정규직·공제 가입 여부)
   *   INELIG  — p001 (income level3 > level2), p003 (무주택 OK이나 취업중이라 employment [] 통과, income OK), p004 (취업 중)
   *   주의: p012는 income level3 > level2(60%) → INELIG
   */
  seoulEmployee: {
    id: 'profile_005',
    name: '정예지',
    age: 30,
    region: '서울',
    employmentStatus: 'employed',
    employerType: 'sme',
    incomeLevel: 'level3',
    educationLevel: 'university',
    householdType: 'single',
    isHomeless: true,
    createdAt: '2026-04-29T09:00:00Z',
  },

};
