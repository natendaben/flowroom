// ~~~~~~~~~~~~~~~~~~~~~~ INCLUDE LIBRARIES ~~~~~~~~~~~~~~~~~~~~~~

#include <SPI.h>
#include <MFRC522.h>
#include <FastLED.h> //FastLED library

// ~~~~~~~~~~~~~~~~~~~~~~ DEFINE PINS AND NUMBERS ~~~~~~~~~~~~~~~~~~~~~~

//RFID reader setup
#define SS_PIN 53 //SDA Pin
#define RST_PIN 5
MFRC522 mfrc522(SS_PIN, RST_PIN); // Instance of the mfrc522 class

//Phone slot light strip
#define PHONE_SLOT_NUM_LEDS 5
#define PHONE_SLOT_DATA_PIN 22
CRGB phone_slot_leds[PHONE_SLOT_NUM_LEDS];

//Room light strips
#define ROOM_STRIP_NUM_LEDS 150
CRGB room_strip_leds[ROOM_STRIP_NUM_LEDS]; //array for both room strips
  //separate data pins for each strip
  #define ROOM_STRIP1_DATA_PIN 24
  #define ROOM_STRIP2_DATA_PIN 25

//FX light strip
#define NUM_LEDS       81
#define DATA_PIN       28
#define DATA_PIN2      27
#define VOLTS           5
#define MAX_MA      20000
CRGBArray<NUM_LEDS> leds;
CRGBArray<NUM_LEDS> leds2;
int twinkle_speed = 4;
int twinkle_density = 6;
CRGB gBackgroundColor = CRGB::Black;
#define AUTO_SELECT_BACKGROUND_COLOR 1
CRGBPalette16 currentFxPalette;
CRGBPalette16 targetFxPalette;

//Control panel
#define CONTROL_PANEL_NUM_LEDS 5
#define CONTROL_PANEL_DATA_PIN 26
CRGB control_panel_leds[CONTROL_PANEL_NUM_LEDS];

// ~~~~~~~~~~~~~~~~~~~~~~ DEFINE COLORS ~~~~~~~~~~~~~~~~~~~~~~
#define seaBlue 0x00faf6
//  Beach - Light blues / tans / waves
CRGB beach = seaBlue;
//  Desert - Light brown / fire effect
CRGB desert = CHSV(40,255,255);
//  Forest - Deep greens / blue / stream
CRGB forest = CHSV(105,255,255);
//  Thunderstorm - Dark blue / white lightning flashes
CRGB storm = CRGB::MidnightBlue;
//  Underwater - Deep blues  / light grey bubbles
CRGB water = CHSV(170,255,255);

//light blue color for when user walks into room
CRGB lightBlue;

// Black palette (off)
const TProgmemRGBPalette16 Black_p FL_PROGMEM =
{
  CRGB::Black,CRGB::Black,CRGB::Black,CRGB::Black,
  CRGB::Black,CRGB::Black,CRGB::Black,CRGB::Black,
  CRGB::Black,CRGB::Black,CRGB::Black,CRGB::Black,
  CRGB::Black,CRGB::Black,CRGB::Black,CRGB::Black
};

//OCEAN PALETTE
// A mostly blue palette with white accents.
// "CRGB::Gray" is used as white to keep the brightness more uniform.
const TProgmemRGBPalette16 Ocean_p FL_PROGMEM =
{  CRGB::Blue, CRGB::Blue, CRGB::Blue, CRGB::Blue, 
   CRGB::Blue, CRGB::Blue, CRGB::Blue, CRGB::Blue, 
   CRGB::MidnightBlue, CRGB::MidnightBlue, CRGB::Blue, CRGB::Blue, 
   CRGB::MidnightBlue, CRGB::Azure, CRGB::Azure, CRGB::MidnightBlue };

//DESERT PALETTE
// Tans with oranges and reds of a desert campfire.
#define Tan 0xffde4d
const TProgmemRGBPalette16 Desert_p FL_PROGMEM =
{  CRGB::DarkGoldenrod,CRGB::DarkGoldenrod,CRGB::DarkGoldenrod,CRGB::DarkGoldenrod,
   CRGB::DarkGoldenrod,CRGB::DarkGoldenrod,CRGB::DarkGoldenrod,CRGB::DarkGoldenrod,
   CRGB::DarkGoldenrod,CRGB::Gold,CRGB::Gold,CRGB::Orange,
   CRGB::Orange,CRGB::OrangeRed,CRGB::OrangeRed,CRGB::OrangeRed };
   
//FOREST PALETTE
// A mostly green palette with blue accents.
const TProgmemRGBPalette16 Forest_p FL_PROGMEM =
{  CRGB::Green,CRGB::Green,CRGB::Green,CRGB::Green,
   CRGB::ForestGreen,CRGB::ForestGreen,CRGB::ForestGreen,CRGB::ForestGreen,
   CRGB::ForestGreen,CRGB::ForestGreen,CRGB::Green,CRGB::Green,
   CRGB::DarkBlue, CRGB::Blue, CRGB::Aqua, CRGB::Blue };

//BEACH PALETTE
// A mostly tan palette with blue accents.
#define seaBlue 0x00faf6
const TProgmemRGBPalette16 Beach_p FL_PROGMEM =
{  CRGB::Gold,CRGB::Gold,CRGB::Gold,CRGB::Gold,
   CRGB::Gold,CRGB::Gold,CRGB::Gold,CRGB::Gold,
   CRGB::Yellow, CRGB::Yellow, seaBlue, seaBlue, 
   seaBlue, seaBlue, CRGB::Blue, CRGB::Blue };

//STORM PALETTE
// A mostly blue palette with white accents.
const TProgmemRGBPalette16 Storm_p FL_PROGMEM =
{  CRGB::MidnightBlue,CRGB::MidnightBlue,CRGB::MidnightBlue,CRGB::MidnightBlue,
   CRGB::Navy,CRGB::Navy,CRGB::Navy,CRGB::Navy,
   CRGB::Navy,CRGB::Navy,CRGB::Navy,CRGB::Navy,
   CRGB::MidnightBlue,CRGB::MidnightBlue,CRGB::White,CRGB::White };

// ~~~~~~~~~~~~~~~~~~~~~~ DEFINE VARIABLES ~~~~~~~~~~~~~~~~~~~~~~

CRGB roomStripColor, controlPanelColor;
int switchPin, switchPin2;
bool tagHasBeenApplied = false;

// ~~~~~~~~~~~~~~~~~~~~~~ SETUP FUNCTION ~~~~~~~~~~~~~~~~~~~~~~

void setup() {
   delay(3000); //Safety startup delay
   //Initialize
   Serial.begin(9600);
   SPI.begin();       // Init SPI bus
   mfrc522.PCD_Init(); // Init MFRC522
   
   FastLED.setBrightness(200);
   FastLED.addLeds<NEOPIXEL, PHONE_SLOT_DATA_PIN>(phone_slot_leds, PHONE_SLOT_NUM_LEDS).setCorrection(TypicalLEDStrip);
   FastLED.addLeds<NEOPIXEL, ROOM_STRIP1_DATA_PIN>(room_strip_leds, ROOM_STRIP_NUM_LEDS).setCorrection(TypicalLEDStrip);
   FastLED.addLeds<NEOPIXEL, ROOM_STRIP2_DATA_PIN>(room_strip_leds, ROOM_STRIP_NUM_LEDS).setCorrection(TypicalLEDStrip);
   FastLED.addLeds<NEOPIXEL, CONTROL_PANEL_DATA_PIN>(control_panel_leds, CONTROL_PANEL_NUM_LEDS).setCorrection(TypicalLEDStrip);
   Serial.println("RFID reading UID");

   pinMode(A14, INPUT);
   pinMode(A15, INPUT);
//    Serial.println(""); //program breaks if delay exists but this line doesn't, not sure why... something to do with mfrc522 library?
  
  
  //FX strip setup
  FastLED.setMaxPowerInVoltsAndMilliamps( VOLTS, MAX_MA);
  FastLED.addLeds<NEOPIXEL,DATA_PIN>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
  FastLED.addLeds<NEOPIXEL,DATA_PIN2>(leds2, NUM_LEDS).setCorrection(TypicalLEDStrip);

    currentFxPalette = Black_p; //set fx strip to black
    targetFxPalette = Black_p; //set fx strip to black

  lightBlue = CRGB::Aqua;
  lightBlue.nscale8_video(16); //scale to 1/16th to make less bright

  //chooseNextColorPalette(targetFxPalette);
}

// ~~~~~~~~~~~~~~~~~~~~~~ LOOP FUNCTION ~~~~~~~~~~~~~~~~~~~~~~

void loop() {
  switchPin = analogRead(A14);
  switchPin2 = analogRead(A15);

  drawTwinkles(leds);
  drawTwinkles(leds2);
  FastLED.show();
  
  if (switchPin < 900 && switchPin2 < 900){ //Switch is off
    fadeTowardColor( phone_slot_leds, PHONE_SLOT_NUM_LEDS, CRGB::Aqua, 5);
    fadeTowardColor( room_strip_leds, ROOM_STRIP_NUM_LEDS, lightBlue, 5);
    fadeTowardColor( control_panel_leds, CONTROL_PANEL_NUM_LEDS, CRGB::Black, 5);
    FastLED.show();
    Serial.println("0"); //tell p5 to turn down
    roomStripColor = lightBlue;
    controlPanelColor = CRGB::Black;
    //FastLED.delay(10);
    tagHasBeenApplied = false;
    targetFxPalette = Black_p;
  } else { //Switch is on
    if(tagHasBeenApplied == false){
      controlPanelColor = CRGB::Aqua;
    } else {
      controlPanelColor = CRGB::Lime;
    }
    fadeTowardColor( phone_slot_leds, PHONE_SLOT_NUM_LEDS, CRGB::Lime, 50);
    FastLED.show();
    if ( mfrc522.PICC_IsNewCardPresent()){
      tagHasBeenApplied = true;
      if ( mfrc522.PICC_ReadCardSerial()){
        if (mfrc522.uid.uidByte[0] == 0x19 && mfrc522.uid.uidByte[1] == 0xE8 && mfrc522.uid.uidByte[2] == 0xB3 && mfrc522.uid.uidByte[3] == 0xB0) {
          //STORM
           roomStripColor = storm;
           Serial.println("D");
           targetFxPalette = Storm_p;
           twinkle_speed = 6;
           twinkle_density = 1;
        }
        if (mfrc522.uid.uidByte[0] == 0xC9 && mfrc522.uid.uidByte[1] == 0xFA && mfrc522.uid.uidByte[2] == 0x21 && mfrc522.uid.uidByte[3] == 0xB3) {
           roomStripColor = water;
           Serial.println("E");
           targetFxPalette = Ocean_p;
           twinkle_speed = 4;
           twinkle_density = 6;
        }
        if (mfrc522.uid.uidByte[0] == 0xF9 && mfrc522.uid.uidByte[1] == 0xEC && mfrc522.uid.uidByte[2] == 0xC4 && mfrc522.uid.uidByte[3] == 0xB1) {
           roomStripColor = forest;
           Serial.println("C");
           targetFxPalette = Forest_p;
           twinkle_speed = 4;
           twinkle_density = 5;
        }
        if (mfrc522.uid.uidByte[0] == 0xC9 && mfrc522.uid.uidByte[1] == 0xB1 && mfrc522.uid.uidByte[2] == 0xB6 && mfrc522.uid.uidByte[3] == 0xB0) {
           roomStripColor = desert;
           Serial.println("B");
           targetFxPalette = Desert_p;
           twinkle_speed = 5;
           twinkle_density = 1;
        }
        if (mfrc522.uid.uidByte[0] == 0x29 && mfrc522.uid.uidByte[1] == 0x8E && mfrc522.uid.uidByte[2] == 0xAD && mfrc522.uid.uidByte[3] == 0xB0) {
           roomStripColor = beach;
           Serial.println("A");
           targetFxPalette = Beach_p;
           twinkle_speed = 3;
           twinkle_density = 7;
        }
//        Serial.print("Tag UID:");
//        for (byte i = 0; i < mfrc522.uid.size; i++) {
//          Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
//          Serial.print(mfrc522.uid.uidByte[i], HEX);
//        }
        Serial.println();
        mfrc522.PICC_HaltA();
//        delay(1000); //caused problems with the twinkles
      }
    }
    // fade all existing pixels toward bgColor by "5" (out of 255)
    fadeTowardColor( room_strip_leds, ROOM_STRIP_NUM_LEDS, roomStripColor, 5);
    fadeTowardColor( control_panel_leds, CONTROL_PANEL_NUM_LEDS, controlPanelColor, 20);
    FastLED.show();
    //FastLED.delay(10);
  }
  nblendPaletteTowardPalette( currentFxPalette, targetFxPalette, 50);
}

// ~~~~~~~~~~~~~~~~~~~~~~ HELPER FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~

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


void drawTwinkles( CRGBSet& L)
{
  // "PRNG16" is the pseudorandom number generator
  uint16_t PRNG16 = 11337;
  
  uint32_t clock32 = millis();

  // Set up the background color, "bg".
  // if AUTO_SELECT_BACKGROUND_COLOR == 1, and the first two colors of
  // the current palette are identical, then a deeply faded version of
  // that color is used for the background color
  CRGB bg;
  if( (AUTO_SELECT_BACKGROUND_COLOR == 1) &&
      (currentFxPalette[0] == currentFxPalette[1] )) {
    bg = currentFxPalette[0];
    uint8_t bglight = bg.getAverageLight();
    if( bglight > 64) {
      bg.nscale8_video( 16); // very bright, so scale to 1/16th
    } else if( bglight > 16) {
      bg.nscale8_video( 64); // not that bright, so scale to 1/4th
    } else {
      bg.nscale8_video( 86); // dim, scale to 1/3rd.
    }
  } else {
    bg = gBackgroundColor; // just use the explicitly defined background color
  }

  uint8_t backgroundBrightness = bg.getAverageLight();
  
  for( CRGB& pixel: L) {
    PRNG16 = (uint16_t)(PRNG16 * 2053) + 1384; // next 'random' number
    uint16_t myclockoffset16= PRNG16; // use that number as clock offset
    PRNG16 = (uint16_t)(PRNG16 * 2053) + 1384; // next 'random' number
    // use that number as clock speed adjustment factor (in 8ths, from 8/8ths to 23/8ths)
    uint8_t myspeedmultiplierQ5_3 =  ((((PRNG16 & 0xFF)>>4) + (PRNG16 & 0x0F)) & 0x0F) + 0x08;
    uint32_t myclock30 = (uint32_t)((clock32 * myspeedmultiplierQ5_3) >> 3) + myclockoffset16;
    uint8_t  myunique8 = PRNG16 >> 8; // get 'salt' value for this pixel

    // We now have the adjusted 'clock' for this pixel, now we call
    // the function that computes what color the pixel should be based
    // on the "brightness = f( time )" idea.
    CRGB c = computeOneTwinkle( myclock30, myunique8);

    uint8_t cbright = c.getAverageLight();
    int16_t deltabright = cbright - backgroundBrightness;
    if( deltabright >= 32 || (!bg)) {
      // If the new pixel is significantly brighter than the background color, 
      // use the new color.
      pixel = c;
    } else if( deltabright > 0 ) {
      // If the new pixel is just slightly brighter than the background color,
      // mix a blend of the new color and the background color
      pixel = blend( bg, c, deltabright * 8);
    } else { 
      // if the new pixel is not at all brighter than the background color,
      // just use the background color.
      pixel = bg;
    }
  }
}

CRGB computeOneTwinkle( uint32_t ms, uint8_t salt)
{
  uint16_t ticks = ms >> (8-twinkle_speed);
  uint8_t fastcycle8 = ticks;
  uint16_t slowcycle16 = (ticks >> 8) + salt;
  slowcycle16 += sin8( slowcycle16);
  slowcycle16 =  (slowcycle16 * 2053) + 1384;
  uint8_t slowcycle8 = (slowcycle16 & 0xFF) + (slowcycle16 >> 8);
  
  uint8_t bright = 0;
  if( ((slowcycle8 & 0x0E)/2) < twinkle_density) {
    bright = attackDecayWave8( fastcycle8);
  }

  uint8_t hue = slowcycle8 - salt;
  CRGB c;
  if( bright > 0) {
    c = ColorFromPalette( currentFxPalette, hue, bright, NOBLEND);
  } else {
    c = CRGB::Black;
  }
  return c;
}


// This function is like 'triwave8', which produces a 
// symmetrical up-and-down triangle sawtooth waveform, except that this
// function produces a triangle wave with a faster attack and a slower decay:
//
//     / \ 
//    /     \ 
//   /         \ 
//  /             \ 
//

uint8_t attackDecayWave8( uint8_t i)
{
  if( i < 86) {
    return i * 3;
  } else {
    i -= 86;
    return 255 - (i + (i/2));
  }
}
