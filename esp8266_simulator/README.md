# ESP8266 Water Sensor Simulator

ไฟล์นี้ใช้สำหรับทดสอบระบบ Water-MaaS โดยไม่ต้องมีเซ็นเซอร์จริง  
ESP8266 จะจำลองค่า pH / DO / BOD / Turbidity / Temperature แล้วส่งเข้า Google Sheets ทุก 30 วินาที

---

## อุปกรณ์ที่ต้องใช้

| อุปกรณ์ | ราคาโดยประมาณ |
|---|---|
| ESP8266 NodeMCU V3 | ~80–120 บาท |
| สาย USB Micro | มีอยู่แล้ว |
| **รวม** | **~100 บาท** |

ซื้อได้จาก: Shopee / Lazada / ร้าน IC ทั่วไป  
ค้นหา: "NodeMCU ESP8266 CH340"

---

## ติดตั้ง Arduino IDE

1. ดาวน์โหลด [Arduino IDE 2.x](https://www.arduino.cc/en/software)
2. เพิ่ม ESP8266 Board Package:
   - ไปที่ **File → Preferences**
   - ใส่ URL นี้ใน "Additional boards manager URLs":
     ```
     http://arduino.esp8266.com/stable/package_esp8266com_index.json
     ```
   - ไปที่ **Tools → Board → Boards Manager** ค้นหา "esp8266" และกด Install
3. ติดตั้ง Library:
   - ไปที่ **Sketch → Include Library → Manage Libraries**
   - ค้นหา **ArduinoJson** by Benoît Blanchon → Install (เลือก v6.x)

---

## ตั้งค่าก่อน Upload

เปิดไฟล์ `esp8266_simulator.ino` แก้ค่า 3 อย่างนี้:

```cpp
const char* WIFI_SSID     = "YOUR_WIFI_NAME";       // ชื่อ WiFi ของคุณ
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";   // รหัส WiFi ของคุณ
const char* APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

และตั้งค่า Station/Factory ให้ตรงกับ Google Sheet:
```cpp
const char* STATION_ID = "st-01";
const char* FACTORY_ID = "factory-abc";
```

---

## Upload

1. เสียบ ESP8266 เข้า USB
2. ไปที่ **Tools → Board** → เลือก "NodeMCU 1.0 (ESP-12E Module)"
3. ไปที่ **Tools → Port** → เลือก COM port ของ ESP (ถ้าไม่เห็น ต้องติดตั้ง [CH340 driver](https://sparks.gogo.co.nz/ch340.html))
4. กด **Upload** (→)
5. เปิด **Serial Monitor** (Ctrl+Shift+M) ตั้ง Baud Rate เป็น **115200**

---

## ผลที่ควรเห็นใน Serial Monitor

```
=================================
  Water-MaaS ESP8266 Simulator
=================================
Station: st-01
Factory: factory-abc
Interval: 30 วินาที

🔌 กำลังเชื่อม WiFi: MyWiFi
......
✅ WiFi เชื่อมสำเร็จ!
   IP: 192.168.1.42

──────────────────────────────
  pH          : 7.18
  DO          : 6.43 mg/L
  Est. BOD    : 16.50 mg/L
  Turbidity   : 14.20 NTU
  Temperature : 28.70 °C
──────────────────────────────
📡 กำลังส่งข้อมูล...
✅ บันทึกเข้า Sheet เรียบร้อย
```

---

## เพิ่ม Action `addReading` ใน Apps Script

ฝั่ง Google Apps Script ต้องรองรับ action นี้ด้วย เพิ่มโค้ดนี้ใน `doGet(e)`:

```javascript
if (action === 'addReading') {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SensorData');
  sheet.appendRow([
    new Date().toISOString(),        // timestamp
    e.parameter.station_id,
    e.parameter.factory_id,
    parseFloat(e.parameter.ph),
    parseFloat(e.parameter.temperature),
    parseFloat(e.parameter.dissolved_oxygen),
    parseFloat(e.parameter.estimated_bod),
    parseFloat(e.parameter.turbidity),
    'iot-device'                     // source
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## อยากใช้เซ็นเซอร์จริง?

ในไฟล์ `.ino` มี comment บอกวิธีเปลี่ยนทุกฟังก์ชัน เช่น `readPH()`, `readDO()`, `readTurbidity()`  
เพียงแทนที่บรรทัดที่ขึ้นต้นด้วย `sim_` ด้วยโค้ดอ่านค่าจริงจาก analog pin ครับ
