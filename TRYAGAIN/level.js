// DECLARE GLOBAL VARIABLES
//#region
const playerObject = document.getElementById('square');
const topSpeed = 10;
const turnRadius = 5;                               
let X;
let Y;
let playerPosition = [0,0];
let playerRotation = 0; 
let currentSpeed = 0;
let isHost = false;
//#endregion

  // UTILITY FUNCTIONS
  //#region 
  const findCoordinates = (degrees) => {
    let radians = degrees*(Math.PI/180)
    X = currentSpeed*Math.cos(radians);
    Y = currentSpeed*Math.sin(radians);                
  };
  
  const accelerate = (mod) => {
    if (keyVerb[0].tween === true || keyVerb[1].tween === true) {
      keyVerb[0].tween = false;
      keyVerb[1].tween = false;
    }
    playerPosition[0] += mod*X; 
    playerPosition[1] += mod*Y; 
    if (currentSpeed < topSpeed) {
      currentSpeed++
    }                    
  }        
  
  const deccelerate = (mod) => {
    playerPosition[0] += mod*X; 
    playerPosition[1] += mod*Y; 
    if (currentSpeed > 0) {
      currentSpeed--
    } else {
      keyVerb[0].tween = false;
      keyVerb[1].tween = false;
    }
  }
  
  const steerLeft = () => {
    if (keyVerb[0].bool === true || keyVerb[0].tween === true) {
      playerRotation += turnRadius
    } else if (keyVerb[1].bool === true || keyVerb[1].tween === true) {
      playerRotation -= turnRadius
    }
  }
  
  const steerRight = () => {
    if (keyVerb[0].bool === true || keyVerb[0].tween === true) {
      playerRotation -= turnRadius
    } else if (keyVerb[1].bool === true || keyVerb[1].tween === true) {
      playerRotation += turnRadius
    }
  }
  
  const steerEnd = (mod) => {
    keyVerb[mod].tween = false
  }
  // #endregion
  
  // BUTTON-PRESS OBJECTS ARRAY 
  //#region 
  let keyVerb = [
    {button: "w", tween: false, bool: false, otherAction: deccelerate, action: accelerate, modifier: -1},
    {button: "s", tween: false, bool: false, otherAction: deccelerate, action: accelerate, modifier: 1},
    {button: "a", tween: false, bool: false, otherAction: steerEnd, action: steerLeft, modifier: 2},      
    {button: "d", tween: false, bool: false, otherAction: steerEnd, action: steerRight, modifier: 3}
  ];
  //#endregion
  
  // KEYPRESS SOCKET HANDLERS
  //#region

  // test for eventlistener generator

  document.addEventListener('keydown', (e) => {                
    for (let i = 0; i < keyVerb.length; i++) {
      if (e.key === keyVerb[i].button) {
        privateChannel.push("keydownTrue", {message: keyVerb[i].button});
      }
    }
  });
  
  document.addEventListener('keyup', (e) => {                
    for (let i = 0; i < keyVerb.length; i++) {
      if (e.key === keyVerb[i].button) {
        privateChannel.push("keyupTrue", {message: keyVerb[i].button});          
      }
    }
  });  
  
  privateChannel.on("globalKeyDown", (key) => {
    for (let i = 0; i < keyVerb.length; i++) {
      if (keyVerb[i].button === key.letter) {
        keyVerb[i].bool = true;      
      }
    }
  });
  
  privateChannel.on("globalKeyUp", (key) => {
    for (let i = 0; i < keyVerb.length; i++) {
      if (keyVerb[i].button === key.letter) {
        keyVerb[i].bool = false;
        keyVerb[i].tween = true;
      }
    }
  });
  //#endregion
  
  // LOCAL RENDER-MACHINE
  //#region
  const moveCar = () => {
    
    findCoordinates(playerRotation);                                        
    
    playerObject.style.transform = `rotateZ(${playerRotation*(-1)}deg)`;
    playerObject.style.left = `${playerPosition[1]}px`;
    playerObject.style.top = `${playerPosition[0]}px`;
    
    for (let i = 0; i < keyVerb.length; i++) {
      if (keyVerb[i].bool === true) {                        
        keyVerb[i].action(keyVerb[i].modifier)                                                                               
    } 
    else if (keyVerb[i].tween === true) {
      keyVerb[i].otherAction(keyVerb[i].modifier)
    }
  }; 
  
  let positionPacket = [
    playerPosition[0],
    playerPosition[1],
    playerRotation
  ];
  
  privateChannel.push("updateOutgoing", {update: positionPacket});
};
//#endregion

//GLOBAL RENDER-MACHINE
//#region
privateChannel.on("updateIncoming", (updatePacket) => {
  if (isHost === false) {
    playerObject.style.transform = `rotateZ(${updatePacket.position[2]*(-1)}deg)`;
    playerObject.style.left = `${updatePacket.position[1]}px`;
    playerObject.style.top = `${updatePacket.position[0]}px`;
  }
});
//#endregion

// RENDER-MACHINE STARTER
//#region
const reRender = () => {
  if (isHost === true) {
    setInterval(moveCar, 20);
  }
};
//reRender();
//#endregion