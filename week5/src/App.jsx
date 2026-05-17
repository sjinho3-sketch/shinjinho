import React from "react";
import { createRoot } from "react-dom/client";
import "./App.css";

const lions = [
  {
    id: 1,
    name: "신진호",
    part: "Frontend",
    organization: "멋쟁이사자처럼 수원대",
    image: "https://via.placeholder.com/300",
    badge: "내 카드",
    oneLine: "기획과 사용자 경험을 연결해 서비스를 만드는 사람입니다.",
    intro: "기획과 프론트엔드를 함께 배우며 아이디어를 실제 서비스로 구현하고 있습니다.",
    email: "jinho@example.com",
    phone: "010-0000-0000",
    website: "www.example.com",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    comment: "작은 아이디어도 끝까지 구현해보겠습니다.",
    isMe: true,
  },
  {
    id: 2,
    name: "김사자",
    part: "Backend",
    organization: "멋쟁이사자처럼",
    image: "https://via.placeholder.com/300",
    badge: "Lion",
    oneLine: "안정적인 서버 구조를 설계하는 개발자입니다.",
    intro: "백엔드 개발과 데이터 관리에 관심이 있습니다.",
    email: "lion1@example.com",
    phone: "010-1111-1111",
    website: "www.lion1.com",
    skills: ["Node.js", "Express", "MySQL"],
    comment: "꾸준히 성장하는 개발자가 되겠습니다.",
    isMe: false,
  },
  {
    id: 3,
    name: "이사자",
    part: "Design",
    organization: "멋쟁이사자처럼",
    image: "https://via.placeholder.com/300",
    badge: "Lion",
    oneLine: "사용자가 편하게 느끼는 화면을 디자인합니다.",
    intro: "UI/UX 디자인과 브랜딩에 관심이 많습니다.",
    email: "lion2@example.com",
    phone: "010-2222-2222",
    website: "www.lion2.com",
    skills: ["Figma", "Photoshop", "Branding"],
    comment: "보기 좋은 화면보다 쓰기 좋은 화면을 만들고 싶습니다.",
    isMe: false,
  },
];

function ControlPanel({ totalCount }) {
  return (
    <section className="control-panel">
      <div className="control-group">
        <button>아기 사자 추가</button>
        <button>마지막 아기 사자 삭제</button>
        <span className="count-text">총 {totalCount}명</span>
      </div>

      <div className="control-group">
        <button>랜덤 1명 추가</button>
        <button>랜덤 5명 추가</button>
        <button>전체 새로고침</button>
        <span className="status-text">준비 완료</span>
        <button className="hidden">재시도</button>
      </div>

      <div className="view-options">
        <select>
          <option>전체</option>
          <option>Frontend</option>
          <option>Backend</option>
          <option>Design</option>
        </select>

        <select>
          <option>최신추가순</option>
          <option>이름순</option>
        </select>

        <input type="text" placeholder="이름 검색" />
      </div>

      <form className="add-form hidden">
        <input placeholder="이름" />
        <input placeholder="파트" />
        <input placeholder="관심 기술" />
        <input placeholder="한 줄 소개" />
        <textarea placeholder="자기소개"></textarea>
        <input placeholder="Email" />
        <input placeholder="Phone" />
        <input placeholder="Website" />
        <input placeholder="한 마디" />

        <div className="form-buttons">
          <button type="button">랜덤 값 채우기</button>
          <button type="button">추가하기</button>
          <button type="button">취소</button>
        </div>
      </form>
    </section>
  );
}

function SummaryCard({ lion }) {
  return (
    <article className={`summary-card ${lion.isMe ? "my-card" : ""}`}>
      <div className="image-wrap">
        <img src={lion.image} alt={`${lion.name} 프로필`} />
        <span className="badge">{lion.badge}</span>
      </div>

      <h2>{lion.name}</h2>
      <p className="part">{lion.part}</p>
      <p>{lion.oneLine}</p>
    </article>
  );
}

function DetailCard({ lion }) {
  return (
    <article className="detail-card">
      <h2>{lion.name}</h2>
      <p className="part">
        {lion.part} / {lion.organization}
      </p>

      <section>
        <h3>자기소개</h3>
        <p>{lion.intro}</p>
      </section>

      <section>
        <h3>연락처</h3>
        <ul>
          <li>Email: {lion.email}</li>
          <li>Phone: {lion.phone}</li>
          <li>Website: {lion.website}</li>
        </ul>
      </section>

      <section>
        <h3>관심 기술</h3>
        <ul>
          {lion.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>한 마디</h3>
        <p>{lion.comment}</p>
      </section>
    </article>
  );
}

function App() {
  return (
    <div className="app">
      <header>
        <h1>아기 사자 명단 대시보드</h1>
        <p>React 컴포넌트와 props를 활용한 명단 UI</p>
      </header>

      <ControlPanel totalCount={lions.length} />

      <main>
        <section className="summary-grid">
          {lions.map((lion) => (
            <SummaryCard key={lion.id} lion={lion} />
          ))}
        </section>

        <section className="detail-list">
          {lions.map((lion) => (
            <DetailCard key={lion.id} lion={lion} />
          ))}
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);