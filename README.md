# CANDiY API 예제 (Next.js)

<img width="581" alt="image" src="https://github.com/user-attachments/assets/cf419a1d-5d73-4e13-b65a-7ae8347747c7" />


## 시작하기
.env.example 파일을 복사하여 `.env.local`로 이름을 바꾸고, API 키를 입력하세요.

API 키는 [CANDIY API](https://developer.candiy.io/)에서 발급받을 수 있습니다.

```bash
cp .env.example .env.local
```

## 의존성 설치
이 프로젝트는 [Node.js](https://nodejs.org/)와 [npm](https://www.npmjs.com/) 또는 [yarn](https://yarnpkg.com/) 또는 [pnpm](https://pnpm.io/) 또는 [bun](https://bun.sh/)을 사용합니다.
의존성을 설치하려면 다음 명령어를 실행하세요:

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
# 또는
bun install
````


서버를 시작하려면 다음 명령어를 실행하세요:
```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
# 또는
bun dev
```

## 브라우저 열기
브라우저를 열고 [http://localhost:3000](http://localhost:3000)로 이동하세요.

## API 라우트
API 라우트는 `src/app/api` 디렉터리에 위치해 있습니다. 

## 페이지
- `/` - 메뉴 선택(Home)
- `/nhis/checkup` - 국민건강보험(NHIS) 건강검진 조회 예제 페이지
- `/nhis/treatment-record` - 국민건강보험(NHIS) 진료 및 투약정보 조회 예제 페이지
- `/hira/medical-record` - 건강보험심사평가원(HIRA) 내 진료정보 열람 조회 예제 페이지
- `/hira/medication-overall` - - 건강보험심사평가원(HIRA) 내가 먹는약 한눈에 조회 예제 페이지
