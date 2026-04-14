// js/views.js

const Views = {
  renderLogin() {
    return `
      <div class="login-container">
        <div class="card login-card">
          <div class="login-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
            <h2>통학차량 관리 시스템</h2>
          </div>
          <p style="text-align:center; color:var(--color-text-muted); margin-bottom: 1.5rem;">역할을 선택하여 로그인하세요.</p>
          <div class="form-group">
            <label class="form-label">사용자 성명</label>
            <select id="loginSelect" class="form-control">
              <option value="">-- 로그인 계정 선택 --</option>
              ${store.getData().personnel.map(p => `<option value="${p.name}">${p.name} (${p.role})</option>`).join('')}
            </select>
          </div>
          <button id="btnLogin" class="btn btn-primary" style="margin-top: 0.5rem;">시스템 입장</button>
        </div>
      </div>
    `;
  },

  renderAdmin() {
    const data = store.getData();
    
    // 이수 현황 및 인력 렌더링
    const eduRows = data.personnel.filter(p => p.role !== 'Admin').map(p => {
      const status = store.getEducationStatus(p.educationDate);
      let badgeClass = 'badge-success';
      if(status.status === 1) badgeClass = 'badge-warning';
      if(status.status === 2) badgeClass = 'badge-danger';
      
      return `
        <tr>
          <td>${p.name}</td>
          <td>${p.role}</td>
          <td>${p.educationDate || '없음'}</td>
          <td><span class="badge ${badgeClass}">${status.label}</span></td>
          <td>
            <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="window.app.editPersonnel('${p.id}')">수정</button>
            <button class="btn" style="background-color: var(--color-danger); color:white; padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="window.app.deletePersonnel('${p.id}')">삭제</button>
          </td>
        </tr>
      `;
    }).join('');

    // 운영차량 렌더링
    const vehicleRows = data.vehicles.map(v => {
      return `
        <div style="border: 1px solid var(--color-border); padding: 0.5rem; border-radius: 8px; margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${v.plateNumber}</strong> (${v.type}, ${v.capacity}인승) - ${v.madeYear}년식
            <span style="font-size:0.875rem; color:var(--color-text-muted); display:block;">보험만기: ${v.insuranceExpiry}</span>
          </div>
          <div>
            <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="window.app.editVehicle('${v.id}')">수정</button>
            <button class="btn" style="background-color: var(--color-danger); color:white; padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="window.app.deleteVehicle('${v.id}')">삭제</button>
          </div>
        </div>
      `;
    }).join('');

    // 운행일지 기록 렌더링
    const logRows = data.logs.map(l => `
      <tr>
        <td>${l.date}</td>
        <td>${l.userName}</td>
        <td>${l.route || '-'}</td>
        <td>${l.mileage}km</td>
        <td><button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="ExportService.printLog('${l.id}')">인쇄</button></td>
      </tr>
    `).join('');

    return `
      <header class="app-header">
        <h1>대시보드 (관리자)</h1>
        <div>
          <span style="margin-right: 1rem; font-weight: 500;">${store.session.name}님</span>
          <button id="btnLogout" class="btn-logout">로그아웃</button>
        </div>
      </header>
      <div class="container">
        
        <div class="grid-2">
          <!-- 마스터 데이터 상태 요약 (Mock) -->
          <div class="card">
            <div class="card-title">운영 기초 자원 <button id="btnEditFacility" class="btn btn-primary" style="float:right; padding: 0.25rem 0.5rem; font-size:0.75rem;">학교정보 수정</button></div>
            <p><strong>학교명:</strong> ${data.facility.schoolName}</p>
            <p><strong>대표자:</strong> ${data.facility.representative}</p>
            
            <div style="margin-top: 1rem;">
              <strong>운영차량 (총 ${data.vehicles.length}대)</strong>
              <button id="btnAddVehicle" class="btn btn-primary" style="float:right; padding: 0.25rem 0.5rem; font-size:0.75rem;">차량 추가</button>
              ${vehicleRows}
            </div>
          </div>

          <!-- 교육 이수 현황 -->
          <div class="card">
            <div class="card-title">종사자 안전교육 현황 (2년 갱신) <button id="btnAddPersonnel" class="btn btn-primary" style="float:right; padding: 0.25rem 0.5rem; font-size:0.75rem;">인력 추가</button></div>
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>역할</th>
                    <th>최근이수일</th>
                    <th>상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  ${eduRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 일지 목록 -->
        <div class="card">
          <div class="card-title">최근 운행 / 점검 기록</div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>작성자</th>
                  <th>노선</th>
                  <th>주행거리</th>
                  <th>출력/확인</th>
                </tr>
              </thead>
              <tbody>
                ${logRows.length > 0 ? logRows : '<tr><td colspan="5" style="text-align:center;">기록이 없습니다.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Modals (Hidden by default) -->
      <div id="modalContainer"></div>
    `;
  },

  renderDriver() {
    const p = store.getData().personnel.find(p => p.id === store.session.id);
    const edStatus = store.getEducationStatus(p.educationDate);
    
    // 교육 상태가 만료면 모바일 환경에서 경고창 렌더링
    let warningMsg = '';
    if (edStatus.status === 2) {
      warningMsg = `<div class="card" style="background-color: var(--color-danger-bg); border-color: var(--color-danger);">
                      <p style="color: var(--color-danger); font-weight:bold;">안전교육이 만료되어 운행을 할 수 없습니다. (배차제한 로직 시뮬레이션)</p>
                    </div>`;
    }

    return `
      <header class="app-header">
        <h1>현장 기록 (모바일)</h1>
        <div>
          <button id="btnLogout" class="btn-logout">로그아웃</button>
        </div>
      </header>
      <div class="container">
        
        <div class="card">
          <h2 style="font-size: 1rem; margin-bottom: 0.5rem; color: var(--color-primary);">사용자: ${store.session.name} (${store.session.role})</h2>
          ${warningMsg}
        </div>

        <form id="logForm">
          <!-- 일일 점검표 -->
          <div class="card">
            <div class="card-title">1. 운행 전 일일 안전점검</div>
            <p style="font-size:0.875rem; color:var(--color-text-muted); margin-bottom:1rem;">각 버튼을 터치하여 양호 상태로 전환하세요.</p>
            
            <div class="check-item toggle-check" data-item="tire">
              <span style="font-weight: 500;">타이어 및 차량 외관</span>
              <span class="check-icon">✗ 미점검</span>
            </div>
            <div class="check-item toggle-check" data-item="brake">
              <span style="font-weight: 500;">브레이크 램프 및 점등</span>
              <span class="check-icon">✗ 미점검</span>
            </div>
            <div class="check-item toggle-check" data-item="alcohol">
              <span style="font-weight: 500;">음주여부 (혈중 0%)</span>
              <span class="check-icon">✗ 미점검</span>
            </div>
            <div class="check-item toggle-check" data-item="devices">
              <span style="font-weight: 500;">법정 안전장치(4종) 작동</span>
              <span class="check-icon">✗ 미점검</span>
            </div>
          </div>

          <!-- 운행 일지 기록 -->
          <div class="card">
            <div class="card-title">2. 운행 결과 (일지 정보)</div>
            
            <div class="form-group">
              <label class="form-label">운행 노선</label>
              <input type="text" id="route" class="form-control" placeholder="예: 시내-1코스 등교" required>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">누적 주행거리 (km)</label>
                <input type="number" id="mileage" class="form-control" placeholder="0" required>
              </div>
              <div class="form-group">
                <label class="form-label">탑승학생 총계 (명)</label>
                <input type="number" id="passengers" class="form-control" placeholder="0" required>
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">주유량 (L)</label>
                <input type="number" id="fuelLiters" class="form-control" placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label">주유비 (원)</label>
                <input type="number" id="fuelCost" class="form-control" placeholder="0">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">비고 (특이사항)</label>
              <textarea id="notes" class="form-control" rows="3"></textarea>
            </div>
          </div>
          
          <div class="card" style="text-align:center;">
             <p style="margin-bottom: 1rem; color: var(--color-text-muted); font-size: 0.875rem;">
              본인은 상기 점검 및 운행 결과를 성실히 수행하였음을 확인합니다.
             </p>
             <button type="button" id="btnSignSubmit" class="btn btn-success" style="padding: 1rem; font-size: 1.1rem; width: 100%; border-radius: 999px;">
              디지털 서명 및 제출 승인
             </button>
          </div>
        </form>
      </div>
    `;
  }
};

window.Views = Views;
