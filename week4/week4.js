document.addEventListener("DOMContentLoaded", function () {
  const app = document.getElementById("app");
  const summaryContainer = document.querySelector(".page");
  const detailContainer = document.querySelector(".detail-list");

  let lions = [];
  let currentFilter = "all";
  let currentSort = "latest";
  let currentSearch = "";
  let requestState = "idle";
  let lastRequestAction = null;

  app.innerHTML = `
    <section class="control-panel">
      <div class="control-row">
        <button id="toggleFormBtn" type="button">아기 사자 추가</button>
        <button id="deleteLastBtn" type="button">마지막 아기 사자 삭제</button>
        <p id="memberCount" style="margin:0; font-weight:bold;">총 0명</p>
      </div>

      <div class="control-row">
        <button id="fetchOneBtn" type="button">랜덤 1명 추가</button>
        <button id="fetchFiveBtn" type="button">랜덤 5명 추가</button>
        <button id="refreshAllBtn" type="button">전체 새로고침</button>
      </div>

      <div class="status-box">
        <strong>상태:</strong> <span id="statusText">준비 완료</span>
        <div class="retry-wrap" id="retryWrap" style="display:none;">
          <button id="retryBtn" type="button">재시도</button>
        </div>
      </div>

      <div class="control-row" style="margin-top:14px;">
        <select id="filterPart">
          <option value="all">전체</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Design">Design</option>
        </select>

        <select id="sortBy">
          <option value="latest">최신추가순</option>
          <option value="name">이름순</option>
        </select>

        <input type="text" id="searchName" placeholder="이름으로 검색" />
      </div>

      <form id="lionForm">
        <div class="form-grid">
          <div>
            <label>이름</label><br />
            <input type="text" id="name" />
            <small class="error" id="nameError"></small>
          </div>

          <div>
            <label>파트</label><br />
            <select id="part">
              <option value="">선택하세요</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Design">Design</option>
            </select>
            <small class="error" id="partError"></small>
          </div>

          <div class="full">
            <label>관심 기술 (쉼표로 구분)</label><br />
            <input type="text" id="skills" placeholder="HTML, CSS, JavaScript" />
            <small class="error" id="skillsError"></small>
          </div>

          <div class="full">
            <label>한 줄 소개</label><br />
            <input type="text" id="oneLine" />
            <small class="error" id="oneLineError"></small>
          </div>

          <div class="full">
            <label>자기소개</label><br />
            <textarea id="description" rows="4"></textarea>
            <small class="error" id="descriptionError"></small>
          </div>

          <div>
            <label>이메일</label><br />
            <input type="text" id="email" />
            <small class="error" id="emailError"></small>
          </div>

          <div>
            <label>전화번호</label><br />
            <input type="text" id="phone" />
            <small class="error" id="phoneError"></small>
          </div>

          <div class="full">
            <label>웹사이트</label><br />
            <input type="text" id="website" />
            <small class="error" id="websiteError"></small>
          </div>

          <div class="full">
            <label>한 마디</label><br />
            <input type="text" id="comment" />
            <small class="error" id="commentError"></small>
          </div>

          <div class="full">
            <label>이미지 경로</label><br />
            <input type="text" id="image" placeholder="profile.jpg" />
            <small class="error" id="imageError"></small>
          </div>
        </div>

        <div class="control-row" style="margin-top:14px;">
          <button type="button" id="fillRandomBtn">랜덤 값 채우기</button>
          <button type="submit">추가하기</button>
          <button type="button" id="cancelFormBtn">취소</button>
        </div>
      </form>
    </section>
  `;

  const toggleFormBtn = document.getElementById("toggleFormBtn");
  const deleteLastBtn = document.getElementById("deleteLastBtn");
  const lionForm = document.getElementById("lionForm");
  const cancelFormBtn = document.getElementById("cancelFormBtn");
  const memberCount = document.getElementById("memberCount");

  const fetchOneBtn = document.getElementById("fetchOneBtn");
  const fetchFiveBtn = document.getElementById("fetchFiveBtn");
  const refreshAllBtn = document.getElementById("refreshAllBtn");
  const fillRandomBtn = document.getElementById("fillRandomBtn");

  const statusText = document.getElementById("statusText");
  const retryWrap = document.getElementById("retryWrap");
  const retryBtn = document.getElementById("retryBtn");

  const filterPart = document.getElementById("filterPart");
  const sortBy = document.getElementById("sortBy");
  const searchName = document.getElementById("searchName");

  function setStatus(type, message) {
    requestState = type;
    statusText.textContent = message;

    if (type === "error") {
      retryWrap.style.display = "block";
    } else {
      retryWrap.style.display = "none";
    }

    if (type === "success") {
      setTimeout(() => {
        statusText.textContent = "준비 완료";
      }, 1200);
    }
  }

  function clearErrors() {
    document.querySelectorAll(".error").forEach((el) => {
      el.textContent = "";
    });
  }

  function updateCount() {
    memberCount.textContent = `총 ${lions.length}명`;
  }

  function parseSkills(text) {
    return text
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
  }

  function normalizePart(value) {
    const v = value.trim().toLowerCase();
    if (v.includes("front")) return "Frontend";
    if (v.includes("back")) return "Backend";
    if (v.includes("design")) return "Design";
    return "Frontend";
  }

  function initializeData() {
    const summaryCards = document.querySelectorAll(".page > section");
    const detailCards = document.querySelectorAll(".detail-list .detail-card");

    lions = [];

    summaryCards.forEach((card, index) => {
      const img = card.querySelector("img");
      const name = card.querySelector(".name")?.textContent.trim() || "";
      const partText = card.querySelector(".part")?.textContent.trim() || "Frontend";
      const oneLine = card.querySelector(".one-line")?.textContent.trim() || "";

      const detailCard = detailCards[index];
      const description =
        detailCard?.querySelector(".detail-desc")?.textContent.trim() || "자기소개가 없습니다.";

      lions.push({
        id: Date.now() + Math.random(),
        name,
        part: normalizePart(partText),
        oneLine,
        description,
        skills: [normalizePart(partText), "HTML", "CSS"],
        email: "example@email.com",
        phone: "010-0000-0000",
        website: "https://example.com",
        comment: "반갑습니다!",
        image: img ? img.getAttribute("src") : "profile.jpg",
        isMine: card.classList.contains("card1"),
        createdAt: Date.now() + index
      });
    });

    renderAll();
  }

  function createBadge(skill) {
    const badge = document.createElement("span");
    badge.textContent = skill;
    badge.style.position = "absolute";
    badge.style.top = "10px";
    badge.style.right = "10px";
    badge.style.backgroundColor = "black";
    badge.style.color = "white";
    badge.style.padding = "4px 8px";
    badge.style.borderRadius = "999px";
    badge.style.fontSize = "12px";
    badge.style.fontWeight = "bold";
    return badge;
  }

  function createSummaryCard(lion) {
    const section = document.createElement("section");
    section.className = lion.isMine ? "card1" : "card";
    section.setAttribute("aria-label", "자기소개 요약 카드");

    section.innerHTML = `
      <div style="position:relative;">
        <img class="profile-image" src="${lion.image}" alt="${lion.name} 프로필 이미지">
      </div>
      <h1 class="name">${lion.name}</h1>
      <div class="part">${lion.part}</div>
      <p class="one-line">${lion.oneLine}</p>
    `;

    const imageWrap = section.querySelector("div");
    imageWrap.appendChild(createBadge(lion.skills[0] || lion.part));

    return section;
  }

  function createDetailCard(lion) {
    const article = document.createElement("article");
    article.className = "detail-card";

    const skillItems = lion.skills.map((skill) => `<li>${skill}</li>`).join("");

    article.innerHTML = `
      <h2 class="detail-name">${lion.name}</h2>
      <p class="detail-role">${lion.part}</p>
      <p><strong>동아리명:</strong> 멋쟁이사자처럼</p>
      <p class="detail-desc">${lion.description}</p>

      <div>
        <strong>관심 기술</strong>
        <ul>${skillItems}</ul>
      </div>

      <div>
        <strong>연락처</strong>
        <p>이메일: ${lion.email}</p>
        <p>전화번호: ${lion.phone}</p>
        <p>웹사이트: ${lion.website}</p>
      </div>

      <div>
        <strong>한 마디</strong>
        <p>${lion.comment}</p>
      </div>
    `;

    return article;
  }

  function getViewData() {
    let result = [...lions];

    if (currentFilter !== "all") {
      result = result.filter((lion) => lion.part === currentFilter);
    }

    if (currentSearch.trim() !== "") {
      const keyword = currentSearch.trim().toLowerCase();
      result = result.filter((lion) => lion.name.toLowerCase().includes(keyword));
    }

    if (currentSort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    } else {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }

  function renderAll() {
    summaryContainer.innerHTML = "";
    detailContainer.innerHTML = "";

    const viewData = getViewData();

    if (viewData.length === 0) {
      detailContainer.innerHTML = `
        <div class="empty-message">
          표시할 아기 사자가 없습니다. (필터/검색 조건을 확인해 주세요)
        </div>
      `;
      updateCount();
      return;
    }

    viewData.forEach((lion) => {
      summaryContainer.appendChild(createSummaryCard(lion));
      detailContainer.appendChild(createDetailCard(lion));
    });

    updateCount();
  }

  function validateForm() {
    clearErrors();
    let isValid = true;

    const fields = [
      { id: "name", message: "이름을 입력하세요." },
      { id: "part", message: "파트를 선택하세요." },
      { id: "skills", message: "관심 기술을 입력하세요." },
      { id: "oneLine", message: "한 줄 소개를 입력하세요." },
      { id: "description", message: "자기소개를 입력하세요." },
      { id: "email", message: "이메일을 입력하세요." },
      { id: "phone", message: "전화번호를 입력하세요." },
      { id: "website", message: "웹사이트를 입력하세요." },
      { id: "comment", message: "한 마디를 입력하세요." },
      { id: "image", message: "이미지 경로를 입력하세요." }
    ];

    fields.forEach((field) => {
      const input = document.getElementById(field.id);
      if (!input.value.trim()) {
        document.getElementById(field.id + "Error").textContent = field.message;
        isValid = false;
      }
    });

    return isValid;
  }

  function resetForm() {
    lionForm.reset();
    clearErrors();
  }

  function makeLionFromApi(user) {
    const parts = ["Frontend", "Backend", "Design"];
    const randomPart = parts[Math.floor(Math.random() * parts.length)];

    return {
      id: Date.now() + Math.random(),
      name: `${user.name.first} ${user.name.last}`,
      part: randomPart,
      oneLine: `${randomPart}에 관심이 많은 아기 사자입니다.`,
      description: `${user.name.first} ${user.name.last}는 새로운 기술을 배우고 협업하는 것을 좋아합니다.`,
      skills:
        randomPart === "Frontend"
          ? ["HTML", "CSS", "JavaScript"]
          : randomPart === "Backend"
          ? ["Node.js", "API", "DB"]
          : ["Figma", "UI", "UX"],
      email: user.email,
      phone: user.phone,
      website: user.picture.large,
      comment: "잘 부탁드립니다!",
      image: user.picture.large,
      isMine: false,
      createdAt: Date.now() + Math.random()
    };
  }

  async function fetchRandomUsers(count) {
    const url = `https://randomuser.me/api/?results=${count}&nat=us,gb,ca,au,nz`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("네트워크 응답이 올바르지 않습니다.");
    }

    const data = await response.json();
    return data.results.map(makeLionFromApi);
  }

  async function addRandomUsers(count) {
    try {
      lastRequestAction = () => addRandomUsers(count);
      setStatus("loading", "불러오는 중...");
      const newUsers = await fetchRandomUsers(count);
      lions.push(...newUsers);
      renderAll();
      setStatus("success", "완료!");
    } catch (error) {
      setStatus("error", `불러오기 실패: ${error.message}`);
    }
  }

  async function refreshAllUsers() {
    try {
      lastRequestAction = refreshAllUsers;
      setStatus("loading", "불러오는 중...");

      const currentCount = lions.length;
      const myCards = lions.filter((lion) => lion.isMine);
      const replaceCount = currentCount - myCards.length;

      const newUsers = replaceCount > 0 ? await fetchRandomUsers(replaceCount) : [];
      lions = [...myCards, ...newUsers];

      renderAll();
      setStatus("success", "완료!");
    } catch (error) {
      setStatus("error", `불러오기 실패: ${error.message}`);
    }
  }

  async function fillFormWithRandomUser() {
    try {
      lastRequestAction = fillFormWithRandomUser;
      setStatus("loading", "불러오는 중...");
      const users = await fetchRandomUsers(1);
      const user = users[0];

      document.getElementById("name").value = user.name;
      document.getElementById("part").value = user.part;
      document.getElementById("skills").value = user.skills.join(", ");
      document.getElementById("oneLine").value = user.oneLine;
      document.getElementById("description").value = user.description;
      document.getElementById("email").value = user.email;
      document.getElementById("phone").value = user.phone;
      document.getElementById("website").value = user.website;
      document.getElementById("comment").value = user.comment;
      document.getElementById("image").value = user.image;

      setStatus("success", "완료!");
    } catch (error) {
      setStatus("error", `불러오기 실패: ${error.message}`);
    }
  }

  toggleFormBtn.addEventListener("click", function () {
    lionForm.style.display = lionForm.style.display === "block" ? "none" : "block";
  });

  cancelFormBtn.addEventListener("click", function () {
    lionForm.style.display = "none";
    resetForm();
  });

  deleteLastBtn.addEventListener("click", function () {
    if (lions.length === 0) return;
    lions.pop();
    renderAll();
  });

  fetchOneBtn.addEventListener("click", function () {
    addRandomUsers(1);
  });

  fetchFiveBtn.addEventListener("click", function () {
    addRandomUsers(5);
  });

  refreshAllBtn.addEventListener("click", function () {
    refreshAllUsers();
  });

  fillRandomBtn.addEventListener("click", function () {
    fillFormWithRandomUser();
  });

  retryBtn.addEventListener("click", function () {
    if (lastRequestAction) {
      lastRequestAction();
    }
  });

  filterPart.addEventListener("change", function () {
    currentFilter = this.value;
    renderAll();
  });

  sortBy.addEventListener("change", function () {
    currentSort = this.value;
    renderAll();
  });

  searchName.addEventListener("input", function () {
    currentSearch = this.value;
    renderAll();
  });

  lionForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm()) return;

    const newLion = {
      id: Date.now() + Math.random(),
      name: document.getElementById("name").value.trim(),
      part: document.getElementById("part").value.trim(),
      skills: parseSkills(document.getElementById("skills").value.trim()),
      oneLine: document.getElementById("oneLine").value.trim(),
      description: document.getElementById("description").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      website: document.getElementById("website").value.trim(),
      comment: document.getElementById("comment").value.trim(),
      image: document.getElementById("image").value.trim(),
      isMine: false,
      createdAt: Date.now()
    };

    lions.push(newLion);
    renderAll();
    resetForm();
    lionForm.style.display = "none";
  });

  initializeData();
});