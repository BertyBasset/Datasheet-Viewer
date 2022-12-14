/***************************************************
//Web: http://www.buydisplay.com
EastRising Technology Co.,LTD
Examples for ER-TFTM050-2 
Hardware SPI,4-Wire SPI Interface,5V Power Supply

This will help you to calibrate your touch screen by modify
4 parameters inside RA8875/_utility/RA8875Calibration.h file:
TOUCSRCAL_XLOW  //min value of x you can get
TOUCSRCAL_XHIGH //max value of x you can get
TOUCSRCAL_YLOW  //min value of y you can get
TOUCSRCAL_YHIGH //max value of y you can get
 
Normally those parameters are set as 0.
 
Now run this program and open Serial Monitor, follow indications!
Tested and worked with:
Teensy3,Teensy3.1,Arduino UNO,Arduino YUN,Arduino Leonardo,Stellaris
Works with Arduino 1.6.0 IDE
****************************************************/


#include <SPI.h>
#include <RA8875.h>

//Arduino DUE,Arduino mega2560,Arduino UNO
#define RA8875_INT 4
#define RA8875_CS 10 
#define RA8875_RESET 9

//#if defined(NEEDS_SET_MODULE)//Energia, this case is for stellaris/tiva

//RA8875 tft = RA8875(3);//select SPI module 3
/*
for module 3 (stellaris)
SCLK:  PD_0
MOSI:  PD_3
MISO:  PD_2
SS:    PD_1
*/
//#else

RA8875 tft = RA8875(RA8875_CS,RA8875_RESET);//Teensy3/arduino's

//#endif

uint8_t samples = 20;
uint16_t tempData[20][2];
volatile int count = 0;
volatile uint8_t scount = 0;
uint16_t tx,ty;
uint16_t valx,valy;

uint16_t _XLOW_VAR;
uint16_t _YLOW_VAR;
uint16_t _XHIGH_VAR;
uint16_t _YHIGH_VAR;
bool proceed = true;


void setup() 
{
  Serial.begin(9600);
  //while (!Serial) {;}
 tft.begin(RA8875_480x272);
  tft.touchBegin(RA8875_INT);//enable touch support for RA8875


  tft.changeMode(TEXT);

  if (tft.touchCalibrated()){
    Serial.println("You have old calibration data present!\n");
    Serial.println("\nPlease open RA8875/_utility/RA8875calibration.h and put zero on the following:\n");
    Serial.println("#define TOUCSRCAL_XLOW	0");
    Serial.println("#define TOUCSRCAL_YLOW	0");
    Serial.println("#define TOUCSRCAL_XHIGH	0");
    Serial.println("#define TOUCSRCAL_YHIGH	0\n");
    Serial.println("Then save and try to run this again!");
    tft.setCursor(0,0);
    tft.setTextColor(RA8875_RED);
    tft.println("---> You have old calibration data present! <---");
    tft.setTextColor(RA8875_WHITE);
    tft.println("Please open RA8875/_utility/RA8875calibration.h");
    tft.println("and put zero on the following:");
    tft.println(" ");
    tft.println("   #define TOUCSRCAL_XLOW   0");
    tft.println("   #define TOUCSRCAL_YLOW   0");
    tft.println("   #define TOUCSRCAL_XHIGH  0");
    tft.println("   #define TOUCSRCAL_YHIGH  0");
    tft.println(" ");
    tft.print("Then save and try to run this again!");
    proceed = false;
  } 
  else {
    Serial.println("Start calibration, please follow indications...\n");
    Serial.println("\nPlease press FIRMLY the TOP/LEFT angle of your screen now!\n");
    tft.setCursor(5,tft.height()/2);
    tft.setTextColor(RA8875_WHITE);
    tft.print("Please press the TOP/LEFT angle of your screen now!    www.buydisplay.com");
  }
  tft.changeMode(GRAPHIC);
  if (proceed) tft.fillCircle(5,5,5,RA8875_RED);
}

void loop() 
{

  if(proceed && tft.touchDetect())
  {

    Serial.print("."); 
    if (count > samples-1){
      count = 0;
      tft.touchEnable(false);
      valx = 0; 
      valy = 0;
      for (uint8_t i=0;i<samples;i++){
        valx = valx+tempData[i][0];
        valy = valy+tempData[i][1];
      }
      valx = valx/samples;
      valy = valy/samples;
      if (scount >= 3){
        scount = 255;
        tft.touchEnable(false);
      } 
      else {
        scount++;
      }
      Serial.println();
      switch(scount){
      case 1:// TOP/LEFT
        tft.fillScreen(RA8875_BLACK);
        tft.changeMode(TEXT);
        tft.setCursor(20,tft.height()/2);
        tft.setTextColor(RA8875_WHITE);
        tft.print("Top/Left done. Please do not touch screen...");
        tft.setTextColor(RA8875_RED);
        tft.setFontScale(1);
        tft.setCursor(20,tft.height()/2+40);
        tft.print("Please do not touch screen!");
        tft.setFontScale(0);
        tft.changeMode(GRAPHIC);
        Serial.print("Top/Left done...");
        Serial.print("Please do not touch screen...");
        _XLOW_VAR = valx;
        _YLOW_VAR = valy;
        delay(3000);
        tft.fillScreen(RA8875_BLACK);
        tft.fillCircle(tft.width()-5,tft.height()-5,5,RA8875_RED);
        tft.changeMode(TEXT);
        tft.setCursor(20,tft.height()/2);
        tft.setTextColor(RA8875_WHITE);
        tft.print("ok, Now Touch Bottom/Right angle!");
        tft.changeMode(GRAPHIC);
        Serial.println("\nok, Now Touch Bottom/Right angle!");
        tft.touchEnable(true);
        count = -1;//it prevents a spurious read after touch enable
        break;
      case 2:// BOTTOM/RIGHT
        tft.fillScreen(RA8875_BLACK);
        tft.changeMode(TEXT);
        tft.setCursor(0,0);
        tft.setTextColor(RA8875_WHITE);
        tft.print("Calibration done...watch results!");


        Serial.println("\nCalibration done...watch results");
        _XHIGH_VAR = valx;
        _YHIGH_VAR = valy;
        tft.touchEnable(false);
        tft.setCursor(0,20);
        tft.println("Now open file RA8875/_utility/RA8875Calibration.h");
        Serial.println("\nNow open file RA8875/_utility/RA8875Calibration.h\n");
        Serial.println("Change the following:\n");
        tft.println("Change the following:");
        tft.println(" ");
        tft.setTextColor(RA8875_GREEN);
        tft.print("#define TOUCSRCAL_XLOW   ");
        tft.setTextColor(RA8875_YELLOW);
        tft.println(_XLOW_VAR,DEC);
        tft.setTextColor(RA8875_GREEN);
        tft.print("#define TOUCSRCAL_YLOW   ");
        tft.setTextColor(RA8875_YELLOW);
        tft.println(_YLOW_VAR,DEC);
        tft.setTextColor(RA8875_GREEN);
        tft.print("#define TOUCSRCAL_XHIGH  ");
        tft.setTextColor(RA8875_YELLOW);
        tft.println(_XHIGH_VAR,DEC);
        tft.setTextColor(RA8875_GREEN);
        tft.print("#define TOUCSRCAL_YHIGH  ");
        tft.setTextColor(RA8875_YELLOW);
        tft.println(_YHIGH_VAR,DEC);
        tft.setTextColor(RA8875_WHITE);
        tft.println(" ");
        tft.println("...then save file and you are calibrated!");
        tft.changeMode(GRAPHIC);
        Serial.println("#define TOUCSRCAL_XLOW	0");
        Serial.println("#define TOUCSRCAL_YLOW	0");
        Serial.println("#define TOUCSRCAL_XHIGH	0");
        Serial.println("#define TOUCSRCAL_YHIGH	0");
        Serial.println("\nInto:\n");
        Serial.print("#define TOUCSRCAL_XLOW	");
        Serial.println(_XLOW_VAR,DEC);
        Serial.print("#define TOUCSRCAL_YLOW	");
        Serial.println(_YLOW_VAR,DEC);
        Serial.print("#define TOUCSRCAL_XHIGH	");
        Serial.println(_XHIGH_VAR,DEC);
        Serial.print("#define TOUCSRCAL_YHIGH	");
        Serial.println(_YHIGH_VAR,DEC);
        Serial.println("\nSave and Have a nice day!");
        break;
      case 3:
        break;
      case 255:
        break;
      }
    } 
    else {
      delay(1);
      tft.touchReadRaw(&tx, &ty);//we using 10bit adc data here
      if (count >= 0){
        tempData[count][0] = tx;
        tempData[count][1] = ty;
      }
      count++;
    }
  }
}

