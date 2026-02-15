const JwtStrings = {
  statusIdle: "JWT를 입력하거나 헤더/페이로드를 수정하세요.",
  statusDecoded: "헤더/페이로드를 불러왔습니다.",
  statusInvalidToken: "JWT 형식이 아닙니다.",
  statusParseFailed: "헤더/페이로드를 파싱할 수 없습니다.",
  statusJsonInvalid: "헤더 또는 페이로드 JSON 형식을 확인하세요.",
  statusAlgMissing: "헤더의 alg 값을 확인하세요.",
  statusSecretMissing: "시크릿 키를 입력해야 재서명됩니다.",
  statusAlgNotSupported: "현재는 HS256/HS384/HS512만 지원합니다.",
  statusResigned: "토큰이 재서명되었습니다.",
  toastCopyEmpty: "복사할 JWT가 없습니다.",
  toastCopyOk: "JWT를 복사했습니다.",
};
