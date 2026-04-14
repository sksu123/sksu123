// js/store.js

// 초기 테스트용 데이터 (로컬스토리지에 없을 경우)
const INITIAL_DATA = {
  facility: {
    schoolName: '행복초등학교',
    officeName: '전라남도교육청',
    representative: '김효진',
    uniqueId: '123-45-67890',
    address: '전남 무안군 삼향읍'
  },
  vehicles: [
    {
      id: 'v1',
      plateNumber: '전남70바1234',
      type: '대형',
      capacity: 34,
      madeYear: 2018,
      insuranceExpiry: '2026-12-31',
      hasPermit: true,
      safetyDevices: {
        alightingCheck: true,
        wideMirror: true,
        reverseAlarm: true,
        sideStep: true
      }
    }
  ],
  personnel: [
    {
      id: 'p1',
      name: '이운전',
      role: '운전원', // Admin, 운전원, 동승자
      phone: '010-1234-5678',
      hireDate: '2023-03-01',
      crimeCheckDate: '2023-02-20',
      educationDate: '2024-05-10', // 교육일자 (2년 주기)
    },
    {
      id: 'p2',
      name: '박동승',
      role: '동승자',
      phone: '010-8765-4321',
      hireDate: '2024-03-01',
      crimeCheckDate: '2024-02-25',
      educationDate: '2025-01-10', 
    },
    {
      id: 'p3',
      name: '김관리',
      role: 'Admin',
      phone: '010-0000-0000',
      hireDate: '',
      crimeCheckDate: '',
      educationDate: ''
    }
  ],
  logs: [
    // 운행일지/안전점검 기록
  ]
};

class Store {
  constructor() {
    this.session = null; // 현재 로그인된 사용자 정보 { id, name, role }
    this.init();
  }

  init() {
    if (!localStorage.getItem('sysData')) {
      localStorage.setItem('sysData', JSON.stringify(INITIAL_DATA));
    }
    const savedSession = sessionStorage.getItem('sysSession');
    if (savedSession) {
      this.session = JSON.parse(savedSession);
    }
  }

  getData() {
    return JSON.parse(localStorage.getItem('sysData'));
  }

  saveData(data) {
    localStorage.setItem('sysData', JSON.stringify(data));
  }

  // Auth
  login(name) {
    const data = this.getData();
    const user = data.personnel.find(p => p.name === name);
    if (user) {
      this.session = { id: user.id, name: user.name, role: user.role };
      sessionStorage.setItem('sysSession', JSON.stringify(this.session));
      return true;
    }
    return false;
  }

  logout() {
    this.session = null;
    sessionStorage.removeItem('sysSession');
  }

  // Logs
  addLog(logEntry) {
    const data = this.getData();
    logEntry.id = 'log_' + Date.now();
    logEntry.date = new Date().toISOString().split('T')[0];
    logEntry.createdAt = new Date().toISOString();
    logEntry.userId = this.session.id;
    logEntry.userName = this.session.name;
    
    data.logs.push(logEntry);
    this.saveData(data);
    return logEntry.id;
  }

  getLogs() {
    return this.getData().logs;
  }

  // 교육 상태 계산 (0: 정상, 1: 30일내 만료경고-황색, 2: 만료-적색)
  getEducationStatus(dateStr) {
    if (!dateStr) return { status: 2, label: '미이수' };
    
    const edDate = new Date(dateStr);
    const expireDate = new Date(edDate);
    expireDate.setFullYear(edDate.getFullYear() + 2); // 2년 유효기간

    const now = new Date();
    const diffTime = expireDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 2, label: '만료됨' };
    } else if (diffDays <= 30) {
      return { status: 1, label: `만료 임박(${diffDays}일)` };
    } else {
      return { status: 0, label: '정상' };
    }
  }

  // Update Methods
  updateFacility(newFacilityData) {
    const data = this.getData();
    data.facility = { ...data.facility, ...newFacilityData };
    this.saveData(data);
  }

  upsertPersonnel(personInfo) {
    const data = this.getData();
    const idx = data.personnel.findIndex(p => p.id === personInfo.id);
    if (idx > -1) {
      data.personnel[idx] = { ...data.personnel[idx], ...personInfo };
    } else {
      personInfo.id = 'p_' + Date.now();
      data.personnel.push(personInfo);
    }
    this.saveData(data);
  }

  deletePersonnel(id) {
    const data = this.getData();
    data.personnel = data.personnel.filter(p => p.id !== id);
    this.saveData(data);
  }

  upsertVehicle(vehicleInfo) {
    const data = this.getData();
    if (!vehicleInfo.id) {
      vehicleInfo.id = 'v_' + Date.now();
      data.vehicles.push(vehicleInfo);
    } else {
      const idx = data.vehicles.findIndex(v => v.id === vehicleInfo.id);
      if (idx > -1) {
        data.vehicles[idx] = { ...data.vehicles[idx], ...vehicleInfo };
      }
    }
    this.saveData(data);
  }

  deleteVehicle(id) {
    const data = this.getData();
    data.vehicles = data.vehicles.filter(v => v.id !== id);
    this.saveData(data);
  }
}

window.store = new Store();
