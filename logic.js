/**
 * logic.js — 청년지원 알리미 순수 로직 함수
 *
 * 규칙:
 *   - DOM 의존 없음 / STATE 참조 없음 / 부작용 없음
 *   - React 전환 시 src/logic/ 아래 개별 파일로 1:1 이동
 *   - 모든 함수는 입력만으로 결과를 결정 (순수 함수)
 */

/* ── MATCH LEVELS ─────────────────────────────────────────── */
var MATCH = Object.freeze({
  URGENT: 'urgent',  // 마감 임박 (신청 가능 + D-14 이내)
  HIGH:   'high',    // 신청 가능성 높음 (모든 조건 충족)
  CHECK:  'check',   // 추가 확인 필요 (프로필 정보 부족)
  AGENCY: 'agency',  // 기관 확인 필요 (복잡 조건 존재)
  INELIG: 'inelig',  // 비대상 (명확한 조건 미충족)
});

var DDAY_B = Object.freeze({
  D1: 'D1', D3: 'D3', D7: 'D7', D14: 'D14',
  OPEN: 'OPEN', CLOSED: 'CLOSED',
});

/* ── LOOKUP TABLES ────────────────────────────────────────── */
var INCOME_ORDER = ['level1','level2','level3','level4','level5','level6'];

var INCOME_PCT = {
  level1: '50%', level2: '60%', level3: '100%',
  level4: '120%', level5: '150%', level6: '180% 이상',
};

var EMP_LBL = {
  employed:   '재직 중',
  unemployed: '미취업',
  freelance:  '프리랜서/자영업',
  student:    '재학 중',
  other:      '기타',
};

var EDU_LBL = {
  highschool: '고졸',
  university: '대학 재학/졸업',
  graduate:   '대학원',
  dropout:    '학업중단',
};

/* ── validateProfile ─────────────────────────────────────── */
/**
 * @param {Object} profile  UserProfile
 * @returns {{ valid:boolean, errors:string[], warnings:string[] }}
 */
function validateProfile(profile) {
  var errors = [], warnings = [];
  if (!profile) return { valid: false, errors: ['프로필 없음'], warnings: warnings };

  if (!profile.age || profile.age < 15 || profile.age > 50)
    errors.push('나이를 올바르게 입력해주세요 (15~50세)');
  if (!profile.region)
    errors.push('거주 지역을 선택해주세요');
  if (!profile.employmentStatus)
    errors.push('취업 상태를 선택해주세요');
  if (!profile.incomeLevel)
    warnings.push('소득 정보 미입력 — 소득 조건 있는 정책의 매칭 정확도가 낮아집니다');
  if (!profile.educationLevel)
    warnings.push('학력 정보 미입력 — 학력 조건 있는 정책이 확인 필요로 표시될 수 있습니다');

  return { valid: errors.length === 0, errors: errors, warnings: warnings };
}

/* ── getMatchReasons ─────────────────────────────────────── */
/**
 * 각 자격 조건을 positive / unknown / negative / complex 로 분류
 *
 * @param {Object} user    UserProfile
 * @param {Object} policy  Policy
 * @returns {{ positive:ReasonItem[], unknown:ReasonItem[], negative:ReasonItem[], complex:string[] }}
 *
 * React 전환: src/logic/getMatchReasons.ts
 */
function getMatchReasons(user, policy) {
  var pos = [], unk = [], neg = [];
  var cpx = policy.eligibility.complexConditions.slice(); // defensive copy

  // ── 나이 ──
  var amin = policy.eligibility.age.min;
  var amax = policy.eligibility.age.max;
  if (!user.age) {
    unk.push({ criterion: '나이', reason: '나이 미입력', required: amin + '~' + amax + '세' });
  } else if (user.age >= amin && user.age <= amax) {
    pos.push({ criterion: '나이', userValue: '만 ' + user.age + '세', required: amin + '~' + amax + '세 이내' });
  } else {
    neg.push({ criterion: '나이', userValue: '만 ' + user.age + '세', required: amin + '~' + amax + '세' });
  }

  // ── 취업 상태 ──
  var empAllowed = policy.eligibility.employment.allowed;
  if (empAllowed.length > 0) {
    var empReqLbl = empAllowed.map(function(e) { return EMP_LBL[e] || e; }).join(' 또는 ');
    if (!user.employmentStatus) {
      unk.push({ criterion: '취업 상태', reason: '정보 미입력', required: empReqLbl });
    } else if (empAllowed.indexOf(user.employmentStatus) >= 0) {
      pos.push({ criterion: '취업 상태', userValue: EMP_LBL[user.employmentStatus] || user.employmentStatus, required: empReqLbl });
    } else {
      neg.push({ criterion: '취업 상태', userValue: EMP_LBL[user.employmentStatus] || user.employmentStatus, required: empReqLbl });
    }
  }

  // ── 소득 수준 ──
  var incRule  = policy.eligibility.income;
  var maxLevel = incRule && incRule.maxLevel;
  var incNote  = incRule && incRule.note;
  if (maxLevel) {
    var incReq = '중위소득 ' + INCOME_PCT[maxLevel] + ' 이하' + (incNote ? ' (' + incNote + ')' : '');
    if (!user.incomeLevel) {
      unk.push({ criterion: '소득 수준', reason: '소득 정보 미입력', required: incReq });
    } else {
      var userIdx = INCOME_ORDER.indexOf(user.incomeLevel);
      var maxIdx  = INCOME_ORDER.indexOf(maxLevel);
      if (userIdx <= maxIdx) {
        pos.push({ criterion: '소득 수준', userValue: '중위 ' + INCOME_PCT[user.incomeLevel] + ' 이하', required: incReq });
      } else {
        neg.push({ criterion: '소득 수준', userValue: '중위 ' + INCOME_PCT[user.incomeLevel] + ' 수준', required: incReq });
      }
    }
  }

  // ── 학력 ──
  var eduReq = policy.eligibility.education.required;
  if (eduReq.length > 0) {
    var eduReqLbl = eduReq.map(function(e) { return EDU_LBL[e] || e; }).join(' 또는 ');
    if (!user.educationLevel) {
      unk.push({ criterion: '학력', reason: '학력 정보 미입력', required: eduReqLbl });
    } else if (eduReq.indexOf(user.educationLevel) >= 0) {
      pos.push({ criterion: '학력', userValue: EDU_LBL[user.educationLevel] || user.educationLevel, required: eduReqLbl });
    } else {
      neg.push({ criterion: '학력', userValue: EDU_LBL[user.educationLevel] || user.educationLevel, required: eduReqLbl });
    }
  }

  // ── 거주 지역 (서울형 등 지역 제한 정책) ──
  var regions = policy.eligibility.regions;
  if (regions && regions.length > 0) {
    var regReq = regions.join('·') + ' 거주자';
    if (!user.region) {
      unk.push({ criterion: '거주 지역', reason: '지역 정보 미입력', required: regReq });
    } else if (regions.indexOf(user.region) >= 0) {
      pos.push({ criterion: '거주 지역', userValue: user.region + ' 거주', required: regReq });
    } else {
      neg.push({ criterion: '거주 지역', userValue: user.region + ' 거주', required: regions.join('·') + ' 거주자만 가능' });
    }
  }

  // ── 무주택 ──
  if (policy.eligibility.requiresHomeless) {
    if (user.isHomeless === null || user.isHomeless === undefined) {
      unk.push({ criterion: '무주택', reason: '무주택 여부 미입력', required: '무주택' });
    } else if (user.isHomeless === true) {
      pos.push({ criterion: '무주택', userValue: '무주택', required: '무주택' });
    } else {
      neg.push({ criterion: '무주택', userValue: '주택 보유', required: '무주택' });
    }
  }

  // ── 고용주 유형 (중소기업 등 — 복잡 조건으로 처리) ──
  var empTypeReq = policy.eligibility.employerType;
  if (empTypeReq && empTypeReq.length > 0 && user.employmentStatus === 'employed') {
    if (!user.employerType) {
      // 정보 없으면 복잡 조건으로 분류 (hard fail 아님)
      cpx.push('재직 중인 기업의 중소·중견기업 해당 여부 확인 필요');
    } else if (empTypeReq.indexOf(user.employerType) >= 0) {
      pos.push({ criterion: '사업장 규모', userValue: '중소·중견기업 재직', required: '중소·중견기업 재직' });
    } else {
      cpx.push('재직 중인 기업의 중소·중견기업 해당 여부 확인 필요');
    }
  }

  return { positive: pos, unknown: unk, negative: neg, complex: cpx };
}

/* ── matchPolicy ─────────────────────────────────────────── */
/**
 * 5단계 판정 우선순위:
 *   negative 존재      → INELIG
 *   complex + unknown 없음 → AGENCY
 *   unknown 존재       → CHECK
 *   dday <= 14         → URGENT
 *   나머지              → HIGH
 *
 * @param {Object} user    UserProfile
 * @param {Object} policy  Policy
 * @returns {MatchResult}
 *
 * React 전환: src/logic/matchPolicy.ts
 */
function matchPolicy(user, policy) {
  var reasons = getMatchReasons(user, policy);
  var dday    = calcDDay(policy);
  var bucket  = getDeadlineBucket(policy);

  if (reasons.negative.length > 0)
    return { policy: policy, level: MATCH.INELIG, reasons: reasons, deadlineBucket: bucket, dday: dday };

  if (reasons.complex.length > 0 && reasons.unknown.length === 0)
    return { policy: policy, level: MATCH.AGENCY, reasons: reasons, deadlineBucket: bucket, dday: dday };

  if (reasons.unknown.length > 0)
    return { policy: policy, level: MATCH.CHECK,  reasons: reasons, deadlineBucket: bucket, dday: dday };

  if (dday !== null && dday >= 0 && dday <= 14)
    return { policy: policy, level: MATCH.URGENT, reasons: reasons, deadlineBucket: bucket, dday: dday };

  return { policy: policy, level: MATCH.HIGH, reasons: reasons, deadlineBucket: bucket, dday: dday };
}

/* ── getDeadlineBucket ───────────────────────────────────── */
/**
 * @param {Object} policy  Policy
 * @returns {'D1'|'D3'|'D7'|'D14'|'OPEN'|'CLOSED'|null}
 *
 * React 전환: src/logic/getDeadlineBucket.ts
 */
function getDeadlineBucket(policy) {
  if (policy.isRecurring) return DDAY_B.OPEN;
  var d = calcDDay(policy);
  if (d === null)  return null;
  if (d < 0)       return DDAY_B.CLOSED;
  if (d <= 1)      return DDAY_B.D1;
  if (d <= 3)      return DDAY_B.D3;
  if (d <= 7)      return DDAY_B.D7;
  if (d <= 14)     return DDAY_B.D14;
  return null;
}

/* ── getDashboardSummary ─────────────────────────────────── */
/**
 * @param {Object}        user         UserProfile
 * @param {MatchResult[]} matchResults
 * @returns {DashboardSummary}
 *
 * React 전환: src/logic/getDashboardSummary.ts
 */
function getDashboardSummary(user, matchResults) {
  var counts = { urgent: 0, high: 0, check: 0, agency: 0, inelig: 0 };
  matchResults.forEach(function(r) { counts[r.level]++; });

  var urgent = matchResults
    .filter(function(r) { return r.level === MATCH.URGENT; })
    .sort(function(a, b) { return a.dday - b.dday; });

  var applicable = matchResults
    .filter(function(r) { return r.level === MATCH.HIGH; })
    .slice(0, 3);

  var needsCheck = matchResults
    .filter(function(r) { return r.level === MATCH.CHECK || r.level === MATCH.AGENCY; })
    .slice(0, 2);

  var validation = validateProfile(user);

  return {
    counts:        counts,
    urgent:        urgent,
    applicable:    applicable,
    needsCheck:    needsCheck,
    totalEligible: counts.urgent + counts.high,
    totalUnclear:  counts.check  + counts.agency,
    errors:        validation.errors,
    warnings:      validation.warnings,
  };
}

/* ── computeAllMatches ───────────────────────────────────── */
/**
 * @param {Object}   user
 * @param {Policy[]} policies
 * @returns {MatchResult[]}
 */
function computeAllMatches(user, policies) {
  return policies.map(function(p) { return matchPolicy(user, p); });
}

/* ── buildNotifications ──────────────────────────────────── */
/**
 * URGENT / HIGH 중 D-14 이내인 정책에 대해 알림 생성
 * INELIG / CHECK / AGENCY 는 알림 제외
 *
 * @param {MatchResult[]} results
 * @returns {Notification[]}
 *
 * React 전환: src/logic/buildNotifications.ts
 */
function buildNotifications(results) {
  var seen = {};
  return results
    .filter(function(r) {
      return (r.level === MATCH.URGENT || r.level === MATCH.HIGH)
          && r.dday !== null && r.dday >= 0 && r.dday <= 14;
    })
    .sort(function(a, b) { return a.dday - b.dday; })
    .filter(function(r) {
      if (seen[r.policy.id]) return false;
      seen[r.policy.id] = true;
      return true;
    })
    .map(function(r) {
      return {
        id:          r.policy.id + '_n',
        policyId:    r.policy.id,
        policyTitle: r.policy.title,
        agency:      r.policy.agency,
        dday:        r.dday,
        bucket:      r.deadlineBucket,
        unread:      true,
      };
    });
}

/* ── HELPERS ─────────────────────────────────────────────── */
function calcDDay(policy) {
  if (policy.isRecurring) return null;
  if (!policy.applicationPeriod || !policy.applicationPeriod.end) return null;
  var now = new Date(); now.setHours(0, 0, 0, 0);
  var end = new Date(policy.applicationPeriod.end); end.setHours(0, 0, 0, 0);
  return Math.ceil((end - now) / 86400000);
}

function fmtDate(s) {
  if (!s) return '-';
  var d = new Date(s);
  return d.getFullYear() + '.' +
         String(d.getMonth() + 1).padStart(2, '0') + '.' +
         String(d.getDate()).padStart(2, '0');
}

function ddLabel(d) {
  if (d === null) return '상시';
  if (d < 0)      return '마감';
  if (d === 0)    return 'D-DAY';
  return 'D-' + d;
}

function ddBadgeCls(b) {
  var m = { D1: 'dd-1', D3: 'dd-3', D7: 'dd-7', D14: 'dd-14', OPEN: 'dd-ok', CLOSED: 'dd-ok' };
  return m[b] || 'dd-ok';
}

function urgCls(d) {
  if (d === null || d > 7) return 'b';
  if (d <= 3) return '';
  return 'w';
}
