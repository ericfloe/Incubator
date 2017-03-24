/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

// This includes a simple loop that enables you to do something every minute on the minute.
// I found that the setInterval was not accurate due to the extra overhead that may be occuring within the function.
// This approach uses the setInterval to probe the time several times a second to trigger a process one time at the top of the minute.
// This version keeps an inner count which is averaged by itself.

// Temperature Sensor on A0
var groveSensor = require('jsupm_grove'); // Initialize Temperature Sensor on 0
var sensor = new groveSensor.GroveTemp(0);

//Grove LCD on 12C
var Screen = require('jsupm_i2clcd'); // A new object of class "jsupm_i2clcd" (lcd class)
var Lcd = new Screen.Jhd1313m1 (0, 0x3E, 0x62); //Initialize Jhd1313m1 at 0x62 (RGB_ADDRESS) and 0x3E (LCD_ADDRESS)

// Relay on D6
var mraa = require('mraa'); //require mraa
var myDigitalPin6 = new mraa.Gpio(6); //setup digital read on Digital pin #6 (D6)
myDigitalPin6.dir(mraa.DIR_OUT); //set the gpio direction to output

// Buzzer on D5
var upmBuzzer = require("jsupm_buzzer"); // Initialize Buzzer on GPIO 5
var myBuzzer = new upmBuzzer.Buzzer(5);
var chords = [];
chords.push(upmBuzzer.SI);

// Database
var request = require('request');

// Misc
var dry = 'No';
var pump = 'Off';
var degrees = '0';

// Looping Variables
var i = 1;
var process = 1;
var temp_count = 1;

// Temperature Sensor Variables
var sensor_new = 0;
var sensor_value = 0;
var sensor_average = 0; 
var temp_status = '';
var temp_action = '';

// Initialize LCD, Buzzer & Relay
Lcd.setCursor(0,0);
Lcd.write('Incubator 2.0');
Lcd.setCursor(1,0);
Lcd.write('By Eric Floe'); 
//myBuzzer.stopSound();
myDigitalPin6.write(0);

function monitor() {
    setInterval(function() {            
        var date = new Date();
        var seconds = date.getSeconds();
        var minutes = date.getMinutes();
        var hours = date.getHours();
        
        if(seconds == 0) {          
            if(process == 1){
                
                if((minutes % 10) == 0) { // This ia a modulus function that will be true at 10, 20, 30, etc.
                    //  request('http://data.sparkfun.com/input/bGDmmVvG0EiYZKz6ElKz?private_key=VpE448dpq7UdG4K05M4K&lp='+a); // Do something
                }
                
                sensor_average = (sensor_value/(temp_count - 1)).toFixed(2); //Subtract 1 from temp count since it was incremented
                
                // Evaluate the Temp status
                // Actual Temp Table with 99.5 degrees ideal        Testing temp 69.5
                // Very High:   Above 101.5                 
                // High:        100.5 to 101.5
                // Normal:      98.5 to 100.5                       68.5 to 70.5                  
                // Low:         97.5 to 98.5
                // Very Low:    Below 97.5
            
                if(sensor_average >= 78.5 && sensor_average <= 79.5){
                    temp_normal();
                }
                else if(sensor_average > 80.5 && sensor_average <= 81.5){
                    temp_high();
                }
                else if(sensor_average < 78.5 && sensor_average >= 77.5){
                    temp_low();
                }
                else if(sensor_average > 79.5){
                    temp_very_high();
                }
                else if(sensor_average < 77.5){
                    temp_very_low();
                }

                // Console Reporting Section
                console.log(date);
                console.log('Temperature: ' + sensor_average);
                console.log('Temperature Status: ' + temp_status);
                console.log('Temperature Action: ' + temp_action);
                console.log('Alarm Action: ' + alarm_action);
                console.log('***************************************');
                
                //request('http://data.sparkfun.com/input/WGw1d96V45cNMrXa0vVy?private_key=XR0pWlEPq7FN9M12dbEj&status='+temp_status+'');

                
                request('http://data.sparkfun.com/input/WGw1d96V45cNMrXa0vVy?private_key=XR0pWlEPq7FN9M12dbEj&alarm='+alarm_action+'&dry='+dry+'&heat='+temp_action+'&pump='+pump+'&status='+temp_status+'&temp='+sensor_average+'&turn='+degrees+'&local_time='+date);
                
                // LCD Reporting Section
                Lcd.setCursor(0,0);
                Lcd.write('Temp:' + sensor_average + ' '  + (("0" + hours).slice (-2)) + (("0" + minutes).slice (-2)) + ' '); // extra padding clears out previous text
                Lcd.setCursor(1, 0);
                Lcd.write('Status:' + temp_status + '            '); // extra padding clears out previous text       
                
                // Reset Variables
                sensor_value = 0
                process = 0;
                temp_count = 1; 
                sensor_average = 0
                i = 1;
            }
        }
        else {
            //Temp collection and averaging
            var celsius = sensor.value();         
            // convert celsius to fahrenheit
            var fahrenheit = celsius * (9 / 5) + 32;
            
            sensor_new = fahrenheit;
            sensor_value = sensor_value + sensor_new;
            
            process = 1;
            temp_count++;
            i++;
        }
    }, 100); // Testing several times a second.  
}

monitor();

function temp_very_high()
{
    Lcd.setColor(128, 0, 0); // Red backlight
    temp_status = 'Very High';
    temp_action = 'Heater Off';
    myDigitalPin6.write(0); //set the digital pin for the relay to off
    alarm_action = 'Alarm On';
    myBuzzer.stopSound();
    // setInterval(melody);
}
function temp_high()
{
    Lcd.setColor(128, 128, 0); // Yellow backlight
    temp_status = 'High';
    temp_action = 'Heater Off';
    myDigitalPin6.write(0); //set the digital pin for the relay to off
    alarm_action = 'Alarm Off';
    myBuzzer.stopSound();
}
function temp_normal()
{   
    Lcd.setColor(0, 128, 0); // Green backlight
    temp_status = 'Normal';
    temp_action = 'Heater Off';
    myDigitalPin6.write(0); //set the digital pin for the relay to off
    alarm_action = 'Alarm Off';
    myBuzzer.stopSound();
}
function temp_low()
{   
    Lcd.setColor(128, 128, 0); // Yellow backlight
    temp_status = 'Low';
    temp_action = 'Heater On';
    myDigitalPin6.write(1); //set the digital pin for the relay to on
    alarm_action = 'Alarm Off';
    myBuzzer.stopSound();
}
function temp_very_low()
{   
    Lcd.setColor(128, 0, 0); // Red backlight
    temp_status = 'Very Low';
    temp_action = 'Heater On';
    myDigitalPin6.write(1); //set the digital pin for the relay to on
    alarm_action = 'Alarm On';
    myBuzzer.stopSound();
    setInterval(melody);
}


function melody()
{
    //Play sound for one second
    myBuzzer.playSound(chords[0], 1000000); //play the chord array index[0]
}


/*
// When exiting: clear interval and print message
process.on('SIGINT', function()
{
  clearInterval(myInterval);
  console.log("Exiting...");
  process.exit(0);
});
*/
/*
                if(sensor_average >= 98.5 && sensor_average <= 100.5){
                    temp_normal();
                }
                else if(sensor_average > 100.5 && sensor_average <= 101.5){
                    temp_high();
                }
                else if(sensor_average < 98.5 && sensor_average >= 97.5){
                    temp_low();
                }
                else if(sensor_average > 101.5){
                    temp_very_high();
                }
                else if(sensor_average < 97.5){
                    temp_very_low();
                }
*/