/**
 * Water-MaaS ESP8266 Sensor Simulator
 * =====================================
 * สำหรับทดสอบระบบก่อนมีเซ็นเซอร์จริง
 * จำลองค่าน้ำ (pH, DO, BOD, Turbidity, Temp) แล้วส่งเข้า Google Sheets
 * ทุก 30 วินาที ผ่าน Google Apps Script Web App
 *
 * Hardware:
 *   - ESP8266 NodeMCU (หรือ Wemos D1 Mini)
 *
 * Libraries ที่ต้องติดตั้งใน Arduino IDE:
 *   - ESP8266WiFi      (มาพร้อม ESP8266 board package)
 *   - ESP8266HTTPClient (มาพร้อม ESP8266 board package)
 *   - ArduinoJson      (ติดตั้งจาก Library Manager: ค้นหา "ArduinoJson" by Benoît Blanchon)
 *
 * การตั้งค่า Arduino IDE:
 *   Board Manager URL: http://arduino.esp8266.com/stable/package_esp8266com_index.json
 *   Board: "NodeMCU 1.0 (ESP-12E Module)"
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <ArduinoJson.h>

// ============================================================
//  ⚙️  ตั้งค่าตรงนี้ก่อน Upload
// ============================================================

const char* WIFI_SSID     = "YOUR_WIFI_NAME";       // ชื่อ WiFi
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";   // รหัส WiFi

// Apps Script Web App URL (อันเดียวกับที่ใส่ใน .env)
const char* APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";

// Station ID ที่จะส่งข้อมูลเข้า (ต้องตรงกับ Sheet ของคุณ)
const char* STATION_ID  = "st-01";
const char* FACTORY_ID  = "factory-abc";

// ส่งข้อมูลทุกกี่วินาที (30 = 30 วินาที)
const unsigned long SEND_INTERVAL_MS = 30000;

// ============================================================
//  ค่าเริ่มต้นของเซ็นเซอร์จำลอง (ปรับได้)
// ============================================================

float sim_ph          = 7.2;
float sim_do          = 6.5;
float sim_bod         = 15.0;
float sim_turbidity   = 12.0;
float sim_temperature = 28.5;

// ============================================================
//  ฟังก์ชันสร้างค่าสุ่มแบบ "drift" — เหมือน sensor จริง
//  (ค่าไม่กระโดด แต่เคลื่อนที่ช้าๆ)
// ============================================================

float drift(float current, float minVal, float maxVal, float step) {
  float change = (random(-100, 100) / 100.0) * step;
  float next = current + change;
  if (next < minVal) next = minVal + step;
  if (next > maxVal) next = maxVal - step;
  return next;
}

// ============================================================
//  หากคุณมีเซ็นเซอร์จริง — แทนที่ฟังก์ชันเหล่านี้
// ============================================================

float readPH() {
  // เซ็นเซอร์จริง (pH probe + analog module):
  //   int raw = analogRead(A0);
  //   return (raw / 1023.0) * 14.0;  // ปรับ calibration ตามจริง
  sim_ph = drift(sim_ph, 6.0, 9.0, 0.15);
  return sim_ph;
}

float readDO() {
  // เซ็นเซอร์จริง (DO probe):
  //   int raw = analogRead(A1);  // ถ้าใช้บอร์ดที่มีหลาย analog pin
  //   return (raw / 1023.0) * 12.0;
  sim_do = drift(sim_do, 2.0, 9.0, 0.2);
  return sim_do;
}

float readBOD() {
  // BOD วัดตรงๆ ยาก — ส่วนใหญ่คำนวณจาก DO / turbidity
  // นี่คือค่าประมาณ (estimated BOD)
  sim_bod = drift(sim_bod, 5.0, 50.0, 1.5);
  return sim_bod;
}

float readTurbidity() {
  // เซ็นเซอร์จริง (turbidity sensor เช่น SEN0189):
  //   int raw = analogRead(A0);
  //   float voltage = raw * (5.0 / 1024.0);
  //   return -1120.4 * sq(voltage) + 5742.3 * voltage - 4352.9;
  sim_turbidity = drift(sim_turbidity, 0.0, 100.0, 3.0);
  return sim_turbidity;
}

float readTemperature() {
  // เซ็นเซอร์จริง (DS18B20):
  //   sensors.requestTemperatures();
  //   return sensors.getTempCByIndex(0);
  sim_temperature = drift(sim_temperature, 20.0, 40.0, 0.3);
  return sim_temperature;
}

// ============================================================
//  ส่งข้อมูลเข้า Google Apps Script
// ============================================================

bool sendToSheet(float ph, float do_val, float bod, float turbidity, float temp) {
  // สร้าง URL พร้อม query parameters
  String url = String(APPS_SCRIPT_URL);
  url += "?action=addReading";
  url += "&station_id=" + String(STATION_ID);
  url += "&factory_id=" + String(FACTORY_ID);
  url += "&ph="          + String(ph, 2);
  url += "&dissolved_oxygen=" + String(do_val, 2);
  url += "&estimated_bod="    + String(bod, 2);
  url += "&turbidity="   + String(turbidity, 2);
  url += "&temperature=" + String(temp, 2);

  Serial.println("📡 กำลังส่งข้อมูล...");
  Serial.println("   URL: " + url);

  // HTTPS — ใช้ BearSSL แบบไม่ verify certificate (เหมาะสำหรับ dev/test)
  BearSSL::WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, url);
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);  // Apps Script redirect ทุกครั้ง
  http.setTimeout(10000);  // 10 วินาที timeout

  int httpCode = http.GET();

  if (httpCode > 0) {
    String payload = http.getString();
    Serial.println("   ✅ HTTP " + String(httpCode));
    Serial.println("   Response: " + payload);
    http.end();

    // Parse JSON response
    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, payload);
    if (!err && doc["ok"].as<bool>()) {
      return true;
    }
  } else {
    Serial.println("   ❌ Error: " + http.errorToString(httpCode));
  }

  http.end();
  return false;
}

// ============================================================
//  Setup & Loop
// ============================================================

unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n\n=================================");
  Serial.println("  Water-MaaS ESP8266 Simulator");
  Serial.println("=================================");
  Serial.println("Station: " + String(STATION_ID));
  Serial.println("Factory: " + String(FACTORY_ID));
  Serial.println("Interval: " + String(SEND_INTERVAL_MS / 1000) + " วินาที");
  Serial.println();

  // เชื่อม WiFi
  Serial.print("🔌 กำลังเชื่อม WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    attempts++;
    if (attempts > 30) {
      Serial.println("\n❌ เชื่อม WiFi ไม่ได้ — รีสตาร์ท...");
      ESP.restart();
    }
  }

  Serial.println("\n✅ WiFi เชื่อมสำเร็จ!");
  Serial.println("   IP: " + WiFi.localIP().toString());
  Serial.println();

  randomSeed(micros());  // seed random จาก noise

  // ส่งครั้งแรกทันที
  lastSendTime = millis() - SEND_INTERVAL_MS;
}

void loop() {
  // ตรวจ WiFi หลุด
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  WiFi หลุด — กำลังเชื่อมใหม่...");
    WiFi.reconnect();
    delay(5000);
    return;
  }

  // ถึงเวลาส่งข้อมูลหรือยัง?
  if (millis() - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = millis();

    // อ่านค่าเซ็นเซอร์ (จำลอง หรือ จริงถ้ามี)
    float ph   = readPH();
    float dox  = readDO();
    float bod  = readBOD();
    float turb = readTurbidity();
    float temp = readTemperature();

    // แสดงบน Serial Monitor
    Serial.println("──────────────────────────────");
    Serial.printf("  pH          : %.2f\n", ph);
    Serial.printf("  DO          : %.2f mg/L\n", dox);
    Serial.printf("  Est. BOD    : %.2f mg/L\n", bod);
    Serial.printf("  Turbidity   : %.2f NTU\n", turb);
    Serial.printf("  Temperature : %.2f °C\n", temp);
    Serial.println("──────────────────────────────");

    // ส่งเข้า Google Sheets
    bool ok = sendToSheet(ph, dox, bod, turb, temp);
    if (ok) {
      Serial.println("✅ บันทึกเข้า Sheet เรียบร้อย");
    } else {
      Serial.println("❌ ส่งไม่สำเร็จ — จะลองใหม่รอบหน้า");
    }
    Serial.println();
  }

  delay(100);
}
