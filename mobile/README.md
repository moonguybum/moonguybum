# NFC 전자명함 (모바일 앱)

Android / iOS 휴대폰에 설치해서 사용하는 **네이티브 앱**입니다.

## 기능

- 내 명함 작성 및 휴대폰에 저장
- **NFC 송신** (Android): 상대방 휴대폰에 vCard 전달
- **NFC 수신**: 명함 읽기 후 **연락처에 자동 저장** (`expo-contacts`)
- **파일 공유**: iPhone 등 NFC 송신이 어려운 환경에서 `.vcf` 공유

## 중요: Expo Go로는 NFC가 동작하지 않습니다

`react-native-nfc-manager`는 네이티브 모듈이라 **개발 빌드(Development Build)** 또는 **APK/AAB 빌드**가 필요합니다.

## 설치 및 실행

```bash
cd mobile
npm install
npx expo prebuild
```

### Android APK 만들기 (가장 쉬운 방법)

1. [Expo 계정](https://expo.dev) 생성
2. EAS CLI 설치 및 로그인

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

3. 빌드가 끝나면 QR/링크로 **APK를 휴대폰에 설치**

### 로컬 Android 빌드 (Android Studio 필요)

```bash
npx expo run:android
```

### iOS (Mac + Xcode 필요)

```bash
npx expo run:ios
```

## 사용 방법

### 보내는 사람 (Android)

1. **내 명함** 탭에서 정보 입력 → **명함 저장**
2. **송신** 탭 → **NFC 송신 시작**
3. 상대방 휴대폰과 **등을 맞대기**

### 받는 사람

1. **수신** 탭 → **NFC 수신 시작**
2. 명함이 표시되면 **연락처에 저장** 클릭
3. 권한 허용 시 연락처에 자동 추가

### iPhone 사용자

- **송신**: 내 명함 탭의 **파일 공유**로 `.vcf` 전송
- **수신**: NFC 읽기는 제한적이므로 파일 공유를 권장

## 프로젝트 구조

```
mobile/
  App.js
  src/
    screens/       # 내 명함 / 송신 / 수신
    services/      # NFC, 연락처, 공유
    utils/         # vCard, 저장소
```

## 기술 스택

- Expo SDK 57 + React Native
- react-native-nfc-manager
- expo-contacts
- expo-sharing + expo-file-system
