#include <SPI.h>

#include <MFRC522.h>
#define SS_PIN 53 //SDA Pin
#define RST_PIN 5
MFRC522 mfrc522(SS_PIN, RST_PIN); // Instance of the mfrc522 class

#include <FastLED.h> //FastLED library
#define FIRST_STRIP_NUM_LEDS 5 //ONLY FOR FIRST LED STRIP
#define SECOND_STRIP_NUM_LEDS 10 //ONLY FOR FIRST LED STRIP
#define THIRD_STRIP_NUM_LEDS 16
#define FIRST_DATA_PIN 22
#define SECOND_DATA_PIN 24
#define THIRD_DATA_PIN 26
CRGB first_leds[FIRST_STRIP_NUM_LEDS]; //array for storing led colors
CRGB second_leds[SECOND_STRIP_NUM_LEDS];
CRGB third_leds[THIRD_STRIP_NUM_LEDS];

// ~~~~~~~~~~~~~~~~~~~~~~ DEFINE COLORS ~~~~~~~~~~~~~~~~~~~~~~

//  Beach - Light blues / tans / waves
CRGB beach = CHSV(130,255,255);
//  Desert - Light brown / fire effect
CRGB desert = CHSV(40,255,255);
//  Forest - Deep greens / blue / stream
CRGB forest = CHSV(105,255,255);
//  Thunderstorm - Dark blue / white lightning flashes
CRGB storm = CHSV(180,255,255);
//  Underwater - Deep blues  / light grey bubbles
CRGB water = CHSV(170,255,255);

CRGB targetColor, targetColor2;

int switchPin, switchPin2;
bool tagHasBeenApplied = false;

void setup() {
   //Initialize
   Serial.begin(9600);
   SPI.begin();       // Init SPI bus
   mfrc522.PCD_Init(); // Init MFRC522
   
   FastLED.setBrightness(30);
   FastLED.addLeds<NEOPIXEL, FIRST_DATA_PIN>(first_leds, FIRST_STRIP_NUM_LEDS).setCorrection(TypicalLEDStrip);
   FastLED.addLeds<NEOPIXEL, SECOND_DATA_PIN>(second_leds, SECOND_STRIP_NUM_LEDS).setCorrection(TypicalLEDStrip);
   FastLED.addLeds<NEOPIXEL, THIRD_DATA_PIN>(third_leds, THIRD_STRIP_NUM_LEDS).setCorrection(TypicalLEDStrip);
   Serial.println("RFID reading UID");
//   delay(3000);

   pinMode(A14, INPUT);
   pinMode(A15, INPUT);
//    Serial.println(""); //program breaks if delay exists but this line doesn't, not sure why... something to do with mfrc522 library?
}

void loop() {
  switchPin = analogRead(A14);
  switchPin2 = analogRead(A15);

  if (switchPin < 900 && switchPin2 < 900){
    fadeTowardColor( first_leds, FIRST_STRIP_NUM_LEDS, CRGB::Red, 5);
    fadeTowardColor( second_leds, SECOND_STRIP_NUM_LEDS, CRGB::Black, 5);
    fadeTowardColor( third_leds, THIRD_STRIP_NUM_LEDS, CRGB::Black, 5);
    FastLED.show();
    Serial.println("0"); //tell p5 to turn down
    targetColor = CRGB::Black;
    targetColor2 = CRGB::Black;
    FastLED.delay(10);
    tagHasBeenApplied = false;
  } else {
    if(tagHasBeenApplied == false){
      targetColor2 = CRGB::Red;
    } else {
      targetColor2 = CRGB::Green;
    }
    fadeTowardColor( first_leds, FIRST_STRIP_NUM_LEDS, CRGB::Green, 20);
    FastLED.show();
    if ( mfrc522.PICC_IsNewCardPresent()){
      tagHasBeenApplied = true;
      if ( mfrc522.PICC_ReadCardSerial()){
        if (mfrc522.uid.uidByte[0] == 0x19 && mfrc522.uid.uidByte[1] == 0xE8 && mfrc522.uid.uidByte[2] == 0xB3 && mfrc522.uid.uidByte[3] == 0xB0) {
           targetColor = beach;
           Serial.println("A");
        }
        if (mfrc522.uid.uidByte[0] == 0xC9 && mfrc522.uid.uidByte[1] == 0xFA && mfrc522.uid.uidByte[2] == 0x21 && mfrc522.uid.uidByte[3] == 0xB3) {
           targetColor = desert;
           Serial.println("B");
        }
        if (mfrc522.uid.uidByte[0] == 0xF9 && mfrc522.uid.uidByte[1] == 0xEC && mfrc522.uid.uidByte[2] == 0xC4 && mfrc522.uid.uidByte[3] == 0xB1) {
           targetColor = forest;
           Serial.println("C");
        }
        if (mfrc522.uid.uidByte[0] == 0xC9 && mfrc522.uid.uidByte[1] == 0xB1 && mfrc522.uid.uidByte[2] == 0xB6 && mfrc522.uid.uidByte[3] == 0xB0) {
           targetColor = storm;
           Serial.println("D");
        }
        if (mfrc522.uid.uidByte[0] == 0x29 && mfrc522.uid.uidByte[1] == 0x8E && mfrc522.uid.uidByte[2] == 0xAD && mfrc522.uid.uidByte[3] == 0xB0) {
           targetColor = water;
           Serial.println("E");
        }
//        Serial.print("Tag UID:");
//        for (byte i = 0; i < mfrc522.uid.size; i++) {
//          Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
//          Serial.print(mfrc522.uid.uidByte[i], HEX);
//        }
        Serial.println();
        mfrc522.PICC_HaltA();
        delay(1000);
      }
    } else {

    }
//  
//    // fade all existing pixels toward bgColor by "5" (out of 255)
    fadeTowardColor( second_leds, SECOND_STRIP_NUM_LEDS, targetColor, 5);
    fadeTowardColor( third_leds, THIRD_STRIP_NUM_LEDS, targetColor2, 20);
    FastLED.show();
    FastLED.delay(10);
  }
}




// Helper function that blends one uint8_t toward another by a given amount
void nblendU8TowardU8( uint8_t& cur, const uint8_t target, uint8_t amount)
{
  if( cur == target) return;
  
  if( cur < target ) {
    uint8_t delta = target - cur;
    delta = scale8_video( delta, amount);
    cur += delta;
  } else {
    uint8_t delta = cur - target;
    delta = scale8_video( delta, amount);
    cur -= delta;
  }
}

// Blend one CRGB color toward another CRGB color by a given amount.
// Blending is linear, and done in the RGB color space.
// This function modifies 'cur' in place.
CRGB fadeTowardColor( CRGB& cur, const CRGB& target, uint8_t amount)
{
  nblendU8TowardU8( cur.red,   target.red,   amount);
  nblendU8TowardU8( cur.green, target.green, amount);
  nblendU8TowardU8( cur.blue,  target.blue,  amount);
  return cur;
}

// Fade an entire array of CRGBs toward a given background color by a given amount
// This function modifies the pixel array in place.
void fadeTowardColor( CRGB* L, uint16_t N, const CRGB& bgColor, uint8_t fadeAmount)
{
  for( uint16_t i = 0; i < N; i++) {
    fadeTowardColor( L[i], bgColor, fadeAmount);
  }
}
