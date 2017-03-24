// Requirement Notes
// 4 hours (side to side), 8 hour full cycle, 3 full cycles in a 24 hour period.
// Initialize at 82 degrees, and advance 10 degrees every 40 minutes.
// From 82 to 92 to 102 to 112 degrees, then backwards to 52.
// From 52 to 112 (6 steps) in a total of 4 hours.
// 4 hours (side to side) 6 * 40 minutes

/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
// Leave the above lines for propper jshinting
//Type Node.js Here :)

var servoModule = require("jsupm_servo");

//Instantiate ES08A Servo module on GPIO 5 
var servo = new servoModule.ES08A(5);

function startServo(timeOffset, timeInterval)
{
    servo.setAngle(d);
}       

// Initialize Servo
var d = 82;                             //initialize at 82 degrees
startServo(0, 1); 
    
var up = true;                          //boolean to determine rotation direction  
var i = 1;                              //set loop
var process = 1;
var x = 1

function monitor() {
    var date = new Date(); 
    
    console.log('***************************************'); //print on initialization
    console.log(date);                                      //print on initialization
    console.log("loop " + x);                               //print on initialization
    console.log(d);                                         //print on initialization
    console.log('***************************************'); //print on initialization
    
    setInterval(function() {            
        var date = new Date();
        var seconds = date.getSeconds();
        
        if(seconds == 0) {          
            if(process == 1){   
                
                // Using 4 for testing.  Change to 40 for production.
                if (x == 4){
                    if(up == true){     
                        d = d + 10;                 //set +10 degrees
                        startServo(0, 1);
                        if (d >= 112){
                            up = false              //change direction
                        }
                    }
                    else {
                        d = d - 10;                 //set +10 degrees
                        startServo(0, 1);
                        if (d <= 52){
                            up = true               //change direction
                        }
                    }
                    x = 1;                          //reset loop
                }
                else{
                    x = x + 1;                      //increment loop
                }
                
                console.log(date);                                      //print each loop
                console.log("loop " + x);                               //print each loop
                console.log(d);                                         //print each loop   
                console.log('***************************************'); //print each loop
                
                process = 0;   
            }
        }
        else {
            process = 1;
            i++;
        }
    }, 100); // Testing several times a second.
}

monitor();