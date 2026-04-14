// js/export.js
// 운행일지/안전점검표 인쇄용 뷰 생성

const ExportService = {
  printLog(logId) {
    const data = window.store.getData();
    const log = data.logs.find(l => l.id === logId);
    const facility = data.facility;
    
    if (!log) {
      alert('일지 데이터를 찾을 수 없습니다.');
      return;
    }

    const printWindow = window.open('', '_blank');
    
    let html = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>안전운행기록 - ${log.date}</title>
        <style>
          body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #333; padding: 8px; text-align: center; }
          th { background-color: #f0f0f0; }
          .sign { text-align: right; margin-top: 30px; font-weight: bold; }
          .text-left { text-align: left; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>어린이통학버스 안전운행 및 점검 기록</h1>
          <p>기관명: ${facility.schoolName} | 운행일: ${log.date}</p>
        </div>
        
        <h3>1. 일일 안전점검 내역</h3>
        <table>
          <tr>
            <th>점검항목</th>
            <th>타이어</th>
            <th>브레이크</th>
            <th>음주여부</th>
            <th>안전장치 4종</th>
            <th>점검자 서명 (디지털기록)</th>
          </tr>
          <tr>
            <td>점검결과</td>
            <td>${log.safetyChecks.tire ? '양호' : '불량'}</td>
            <td>${log.safetyChecks.brake ? '양호' : '불량'}</td>
            <td>${log.safetyChecks.alcohol ? '이상없음' : '이상있음'}</td>
            <td>${log.safetyChecks.devices ? '양호' : '미흡'}</td>
            <td>${log.safetyCheckSigName || log.userName} (서명 필)</td>
          </tr>
        </table>

        <h3>2. 운행일지 (노선별)</h3>
        <table>
          <tr>
            <th>노선명/구분</th>
            <th>주행거리(km)</th>
            <th>탑승인원(명)</th>
            <th>주유량(L)</th>
            <th>유류비(원)</th>
            <th>특이사항</th>
          </tr>
          <tr>
            <td>${log.route || '정규노선'}</td>
            <td>${log.mileage || 0}</td>
            <td>${log.passengers || 0}</td>
            <td>${log.fuelLiters || 0}</td>
            <td>${log.fuelCost ? log.fuelCost.toLocaleString() : 0}</td>
            <td class="text-left">${log.notes || '없음'}</td>
          </tr>
        </table>
        
        <div class="sign">
          운행자: ${log.userName} (디지털 서명 완료)<br>
          확인자: ${facility.representative}
        </div>
        <script>
          window.print();
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  }
};

window.ExportService = ExportService;
