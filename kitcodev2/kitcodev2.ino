#include <ArduinoJson.h>
#include <Arduino_SensorKit.h>
#include <Wire.h>
#include <U8g2lib.h>
//#include <qrcode.h>

U8G2_SSD1306_128X64_NONAME_F_SW_I2C u8g2(U8G2_R0, /* clock=*/ SCL, /* data=*/ SDA, /* reset=*/ U8X8_PIN_NONE);

StaticJsonDocument<48> doc;
//char data_out[150];

//QRCode qrcode;

int soil_sensor = A1;
int sound_sensor = A2;
int light_sensor = A3;
int raw_light;
int light;
int sound;
int i=0;
uint8_t y,x;
char mos[4];

const int air_value = 700;
const int water_value = 450;
int raw_moisture,moisturepercent,moisture;

void setup() {
  // initialize serial communication at 9600 bits per second:
  u8g2.begin();
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB14_tr);
  Serial.begin(9600);
  Pressure.begin();
}

// the loop routine runs over and over again forever:
void loop() {
  raw_moisture = analogRead(soil_sensor);
  moisturepercent = map(raw_moisture, air_value, water_value, 0, 100);
  if(moisturepercent<=0)
  {
    moisturepercent = 0;
  }else if(moisturepercent>=100)
  {
    moisturepercent = 100;
  }
  doc[F("m")] = moisturepercent;
  moisture = doc[F("m")];
  doc[F("p")] = Pressure.readPressure();
  doc[F("t")] = Pressure.readTemperature();
  doc[F("a")] = Pressure.readAltitude();
  raw_light = analogRead(light_sensor);
  light = map(raw_light, 0, 1023, 0, 100);
  doc["l"] = light;
  sound = 0; //create variable to store many different readings
  for (i = 0; i < 32; i++) //create a for loop to read 
  { sound += analogRead(sound_sensor);  } //read the sound sensor
  sound >>= 5; //bitshift operation 
  doc[F("s")] = sound;
  //serializeJson(doc, data_out);
  serializeJson(doc, Serial);
  Serial.println();
  const char *data = itoa(moisture, mos, 4);// Convert the String to a C-style string (const char *)
  //uint8_t qrcodeData[qrcode_getBufferSize(1)];
  //qrcode_initText(&qrcode, qrcodeData, 1, ECC_LOW, data);

  // Draw QR code on OLED
  //u8g2.clearBuffer();
  //for (y = 0; y < qrcode.size; y++) {
    //for (x = 0; x < qrcode.size; x++) {
      //if (qrcode_getModule(&qrcode, x, y)) {
      //  u8g2.drawBox(x * 2, y * 2, 2, 2);
      //}
    //}
  //}
  // Send buffer to display
  //u8g2.sendBuffer();
  delay(10000);        // delay in between reads for stability
}
