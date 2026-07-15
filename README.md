# NFC 전자명함 PWA

휴대폰 NFC로 전자명함(vCard)을 주고받고, 상대방 연락처에 자동으로 저장할 수 있는 웹 앱입니다.

## 주요 기능

- **내 명함 작성**: 이름, 회사, 직함, 전화, 이메일, 웹사이트, 주소, 메모
- **NFC 송신**: Web NFC로 `text/vcard` 형식의 명함을 상대방 휴대폰에 전송
- **NFC 수신**: 상대방 명함을 읽어 앱에 표시 후 연락처 저장
- **파일 공유/다운로드**: NFC 미지원 환경에서는 `.vcf` 파일로 공유

## 사용 방법

### 1. 내 명함 등록

1. `내 명함` 탭에서 정보 입력
2. **명함 저장** 클릭

### 2. NFC로 명함 보내기 (송신)

1. `NFC 송신` 탭 이동
2. **NFC 명함 전송 시작** 클릭
3. 상대방 휴대폰과 **등을 맞대거나 가까이** 대기
4. 상대방 기기에서 **연락처 추가 화면**이 열리면 저장

### 3. NFC로 명함 받기 (수신)

1. `NFC 수신` 탭 이동
2. **NFC 수신 시작** 클릭
3. 상대방이 명함을 전송하면 앱에 표시
4. **연락처에 저장**으로 `.vcf` 파일 열기 → 연락처 앱에서 저장

## 지원 환경

| 환경 | NFC 송신 | NFC 수신 | 자동 연락처 저장 |
|------|----------|----------|------------------|
| Android Chrome | ✅ | ✅ | ✅ (OS가 vCard 처리) |
| iOS Safari | ❌ | 제한적 | `.vcf` 공유로 대체 |
| PC 브라우저 | ❌ | ❌ | `.vcf` 다운로드 |

> **참고**: 보안상 연락처는 OS가 사용자 확인 후 저장합니다. 앱이 연락처를 무단으로 저장할 수는 없습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

Android 휴대폰에서 테스트하려면 HTTPS가 필요합니다.

```bash
npm run build
npm run preview -- --host
```

같은 Wi-Fi의 휴대폰 브라우저에서 `https://<PC-IP>:4173` 접속 후 사용하세요.

## 기술 스택

- Vite + Vanilla JavaScript
- Web NFC API (`NDEFReader`)
- vCard 3.0 (`text/vcard`)
- PWA (Service Worker + manifest)

## 프로젝트 구조

```
src/
  main.js      # UI 및 앱 흐름
  nfc.js       # Web NFC 송신/수신
  vcard.js     # vCard 생성/파싱/저장
  style.css    # 스타일
```

## 라이선스

MIT
