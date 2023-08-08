#include <ArduinoJson.h>
#include <Arduino_SensorKit.h>

StaticJsonDocument<250> doc;
char data_out[250];

int soil_sensor = A1;
int sound_sensor = A2;
int light_sensor = A3;

const int air_value = 700;
const int water_value = 450;
int raw_moisture,moisturepercent;

void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(9600);
  Pressure.begin();
}

// the loop routine runs over and over again forever:
void loop() {
  raw_moisture = analogRead(soil_sensor);
  moisturepercent = map(raw_moisture, air_value, water_value, 0, 100);
  if(moisturepercent<=0)
  {
    doc["moisture"] = 0;
  }else if(moisturepercent>=100)
  {
    doc["moisture"] = 100;
  }else{
    doc["moisture"] = moisturepercent;
  }
  doc["pressure"] = Pressure.readPressure();
  doc["temp"] = Pressure.readTemperature();
  doc["acceleration"] = Pressure.readAltitude();
  int raw_light = analogRead(light_sensor);
  int light = map(raw_light, 0, 1023, 0, 100);
  doc["light"] = light;
  int sound = 0; //create variable to store many different readings
  for (int i = 0; i < 32; i++) //create a for loop to read 
  { sound += analogRead(sound_sensor);  } //read the sound sensor
  sound >>= 5; //bitshift operation 
  doc["sound"] = sound;
  serializeJson(doc, data_out);
  Serial.println(data_out);
  delay(30000);        // 30 Secs delay in between reads for stability
}
