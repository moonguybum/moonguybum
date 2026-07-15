# 명함핑 — NFC 전자명함

**명함핑**은 휴대폰 NFC로 전자명함(vCard)을 주고받고, 연락처에 저장하는 앱입니다.

## 모바일 앱 (권장)

**`mobile/`** 폴더에 Android/iOS 네이티브 앱이 있습니다.

```bash
cd mobile
npm install
eas build -p android --profile preview   # APK 설치 파일 생성
```

자세한 설치 방법: [mobile/README.md](./mobile/README.md)

### 모바일 앱 기능

- 내 명함 작성 및 휴대폰 저장
- NFC 송신 (Android)
- NFC 수신 + **연락처에 직접 저장**
- vCard 파일 공유 (iPhone 대안)

> Expo Go가 아닌 **APK/AAB 빌드**가 필요합니다 (NFC 네이티브 모듈 사용).

---

## 웹 PWA (보조)

브라우저에서 사용하는 웹 버전입니다.

```bash
npm install
npm run dev
```

### 웹 기능

- 명함 정보 입력/로컬 저장
- Web NFC 송신/수신 (Android Chrome)
- vCard 파일 공유/다운로드

## 지원 환경

| 기능 | 모바일 앱 (Android) | 모바일 앱 (iOS) | 웹 PWA |
|------|---------------------|-----------------|--------|
| NFC 송신 | ✅ | ❌ | Android Chrome |
| NFC 수신 | ✅ | 제한적 | Android Chrome |
| 연락처 직접 저장 | ✅ | ✅ | ❌ |
| 파일 공유 | ✅ | ✅ | ✅ |

## 라이선스

MIT
