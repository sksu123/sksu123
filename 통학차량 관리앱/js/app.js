// js/app.js

class App {
  constructor() {
    this.appEl = document.getElementById('app');
    this.bindGlobalEvents();
    this.router();
  }

  bindGlobalEvents() {
    window.addEventListener('hashchange', () => this.router());
  }

  router() {
    const session = window.store.session;
    if (!session) {
      window.location.hash = '';
      this.render('login');
      return;
    }

    if (session.role === 'Admin') {
      window.location.hash = 'admin';
      this.render('admin');
    } else {
      window.location.hash = 'driver';
      this.render('driver');
    }
  }

  render(view) {
    if (view === 'login') {
      this.appEl.innerHTML = window.Views.renderLogin();
      document.getElementById('btnLogin').addEventListener('click', () => {
        const name = document.getElementById('loginSelect').value;
        if (!name) return alert('사용자를 선택해주세요.');
        if (window.store.login(name)) {
          this.router();
        } else {
          alert('로그인 실패');
        }
      });
    } 
    else if (view === 'admin') {
      this.appEl.innerHTML = window.Views.renderAdmin();
      document.getElementById('btnLogout').addEventListener('click', () => {
        window.store.logout();
        this.router();
      });
      this.bindAdminEvents();
    } 
    else if (view === 'driver') {
      this.appEl.innerHTML = window.Views.renderDriver();
      document.getElementById('btnLogout').addEventListener('click', () => {
        window.store.logout();
        this.router();
      });

      this.bindDriverEvents();
    }
  }

  bindAdminEvents() {
    const editFacilityBtn = document.getElementById('btnEditFacility');
    if(editFacilityBtn) {
      editFacilityBtn.addEventListener('click', () => {
        const facility = window.store.getData().facility;
        const modalHtml = `
          <div class="modal-overlay" id="modalOverlay">
            <div class="modal-content">
              <h3 class="modal-title">운영 기초 자원 수정</h3>
              <div class="form-group">
                <label class="form-label">학교명</label>
                <input type="text" id="editSchoolName" class="form-control" value="${facility.schoolName}">
              </div>
              <div class="form-group">
                <label class="form-label">대표자</label>
                <input type="text" id="editRepresentative" class="form-control" value="${facility.representative}">
              </div>
              <div class="modal-actions">
                <button type="button" class="btn" id="btnCancelModal">취소</button>
                <button type="button" class="btn btn-primary" id="btnSaveFacility">저장</button>
              </div>
            </div>
          </div>
        `;
        document.getElementById('modalContainer').innerHTML = modalHtml;
        
        document.getElementById('btnCancelModal').addEventListener('click', () => {
          document.getElementById('modalContainer').innerHTML = '';
        });
        document.getElementById('btnSaveFacility').addEventListener('click', () => {
          window.store.updateFacility({
            schoolName: document.getElementById('editSchoolName').value,
            representative: document.getElementById('editRepresentative').value
          });
          document.getElementById('modalContainer').innerHTML = '';
          this.render('admin');
        });
      });
    }

    const addPersonnelBtn = document.getElementById('btnAddPersonnel');
    if(addPersonnelBtn) {
      addPersonnelBtn.addEventListener('click', () => this.editPersonnel(null));
    }

    const addVehicleBtn = document.getElementById('btnAddVehicle');
    if(addVehicleBtn) {
      addVehicleBtn.addEventListener('click', () => this.editVehicle(null));
    }
  }

  editPersonnel(id) {
    const data = window.store.getData();
    let person = { id: '', name: '', role: '운전원', educationDate: '' };
    if (id) {
      person = data.personnel.find(p => p.id === id) || person;
    }
    
    const modalHtml = `
      <div class="modal-overlay" id="modalOverlay">
        <div class="modal-content">
          <h3 class="modal-title">종사자 인력 ${id ? '수정' : '추가'}</h3>
          <div class="form-group">
            <label class="form-label">이름</label>
            <input type="text" id="editPersonName" class="form-control" value="${person.name}">
          </div>
          <div class="form-group">
            <label class="form-label">역할</label>
            <select id="editPersonRole" class="form-control">
              <option value="운전원" ${person.role === '운전원' ? 'selected' : ''}>운전원</option>
              <option value="동승자" ${person.role === '동승자' ? 'selected' : ''}>동승자</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">최근 교육 이수일자</label>
            <input type="date" id="editPersonEduDate" class="form-control" value="${person.educationDate}">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn" id="btnCancelModal">취소</button>
            <button type="button" class="btn btn-primary" id="btnSavePerson">저장</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('modalContainer').innerHTML = modalHtml;
    
    document.getElementById('btnCancelModal').addEventListener('click', () => {
      document.getElementById('modalContainer').innerHTML = '';
    });
    document.getElementById('btnSavePerson').addEventListener('click', () => {
      const nameInput = document.getElementById('editPersonName').value;
      if(!nameInput) return alert("이름을 입력해주세요.");
      
      window.store.upsertPersonnel({
        id: id || '',
        name: nameInput,
        role: document.getElementById('editPersonRole').value,
        educationDate: document.getElementById('editPersonEduDate').value
      });
      document.getElementById('modalContainer').innerHTML = '';
      this.render('admin');
    });
  }

  deletePersonnel(id) {
    if(confirm('정말 이 인력을 삭제하시겠습니까?')) {
      window.store.deletePersonnel(id);
      this.render('admin');
    }
  }

  editVehicle(id) {
    const data = window.store.getData();
    let v = { id: '', plateNumber: '', type: '대형', capacity: 34, madeYear: new Date().getFullYear(), insuranceExpiry: '' };
    if (id) {
      v = data.vehicles.find(v => v.id === id) || v;
    }
    
    const modalHtml = `
      <div class="modal-overlay" id="modalOverlay">
        <div class="modal-content">
          <h3 class="modal-title">운영차량 ${id ? '수정' : '추가'}</h3>
          <div class="form-group">
            <label class="form-label">차량번호</label>
            <input type="text" id="vPlate" class="form-control" value="${v.plateNumber}">
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">차종</label>
              <select id="vType" class="form-control">
                <option value="소형" ${v.type==='소형'?'selected':''}>소형</option>
                <option value="중형" ${v.type==='중형'?'selected':''}>중형</option>
                <option value="대형" ${v.type==='대형'?'selected':''}>대형</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">탑승정원</label>
              <input type="number" id="vCapacity" class="form-control" value="${v.capacity}">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">연식(제작년도)</label>
              <input type="number" id="vYear" class="form-control" value="${v.madeYear}">
            </div>
            <div class="form-group">
              <label class="form-label">보험만기일</label>
              <input type="date" id="vIns" class="form-control" value="${v.insuranceExpiry}">
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn" id="btnCancelModal">취소</button>
            <button type="button" class="btn btn-primary" id="btnSaveVehicle">저장</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('modalContainer').innerHTML = modalHtml;
    
    document.getElementById('btnCancelModal').addEventListener('click', () => {
      document.getElementById('modalContainer').innerHTML = '';
    });
    document.getElementById('btnSaveVehicle').addEventListener('click', () => {
      if(!document.getElementById('vPlate').value) return alert('차량번호를 입력해주세요.');
      window.store.upsertVehicle({
        id: id || '',
        plateNumber: document.getElementById('vPlate').value,
        type: document.getElementById('vType').value,
        capacity: Number(document.getElementById('vCapacity').value),
        madeYear: Number(document.getElementById('vYear').value),
        insuranceExpiry: document.getElementById('vIns').value
      });
      document.getElementById('modalContainer').innerHTML = '';
      this.render('admin');
    });
  }

  deleteVehicle(id) {
    if(confirm('정말 이 차량을 삭제하시겠습니까?')) {
      window.store.deleteVehicle(id);
      this.render('admin');
    }
  }

  bindDriverEvents() {
    const checks = {};
    const checkItems = document.querySelectorAll('.toggle-check');
    checkItems.forEach(item => {
      item.addEventListener('click', function() {
        this.classList.toggle('checked');
        const key = this.getAttribute('data-item');
        const isChecked = this.classList.contains('checked');
        checks[key] = isChecked;
        
        const iconSpan = this.querySelector('.check-icon');
        if(isChecked) {
          iconSpan.textContent = '✓ 양호';
        } else {
          iconSpan.textContent = '✗ 미점검';
        }
      });
    });

    const submitBtn = document.getElementById('btnSignSubmit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const route = document.getElementById('route').value;
        const mileage = document.getElementById('mileage').value;
        const passengers = document.getElementById('passengers').value;

        if(!route || !mileage || !passengers) {
          alert('기본 운행 정보(노선, 거리, 인원)를 입력해주세요.');
          return;
        }

        // 교육 만료 상태 체크 리젝
        const p = store.getData().personnel.find(p => p.id === store.session.id);
        const edStatus = store.getEducationStatus(p.educationDate);
        if (edStatus.status === 2) {
           alert('안전교육이 만료되어 기록을 제출할 수 없습니다. 관리자에게 문의하세요.');
           return;
        }

        const logEntry = {
          safetyChecks: {
            tire: !!checks.tire,
            brake: !!checks.brake,
            alcohol: !!checks.alcohol,
            devices: !!checks.devices
          },
          route: route,
          mileage: Number(mileage),
          passengers: Number(passengers),
          fuelLiters: Number(document.getElementById('fuelLiters').value || 0),
          fuelCost: Number(document.getElementById('fuelCost').value || 0),
          notes: document.getElementById('notes').value,
          safetyCheckSigName: window.store.session.name // 디지털 전자 서명 인입
        };

        const newId = window.store.addLog(logEntry);
        if(newId) {
          alert('디지털 서명 및 운행일지가 제출되었습니다!');
          // 리셋 폼
          document.getElementById('logForm').reset();
          checkItems.forEach(item => {
             item.classList.remove('checked');
             item.querySelector('.check-icon').textContent = '✗ 미점검';
             checks[item.getAttribute('data-item')] = false;
          });
        }
      });
    }
  }
}

// 부트스트랩핑
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
