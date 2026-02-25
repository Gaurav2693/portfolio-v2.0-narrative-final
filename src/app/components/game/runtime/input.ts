// Keyboard input state
export class InputState {
  private keys: Set<string> = new Set();
  
  left = false;
  right = false;
  jumpPressed = false;
  jumpHeld = false;
  runHeld = false;
  resetPressed = false;
  shootPressed = false;
  slidePressed = false;
  hurt1Pressed = false;
  hurt2Pressed = false;
  deathPressed = false;

  private jumpPressedThisFrame = false;
  private shootPressedThisFrame = false;
  private slidePressedThisFrame = false;
  private hurt1PressedThisFrame = false;
  private hurt2PressedThisFrame = false;
  private deathPressedThisFrame = false;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  init() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  cleanup() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown(e: KeyboardEvent) {
    const wasPressed = this.keys.has(e.key.toLowerCase());
    this.keys.add(e.key.toLowerCase());
    
    // Jump pressed only fires once per key press
    if (!wasPressed && (e.key.toLowerCase() === 'w' || e.key === ' ')) {
      this.jumpPressedThisFrame = true;
    }
    
    // Shoot pressed only fires once per key press (J key)
    if (!wasPressed && e.key.toLowerCase() === 'j') {
      console.log('J key pressed - shoot');
      this.shootPressedThisFrame = true;
    }
    
    // Slide pressed only fires once per key press (K key)
    if (!wasPressed && e.key.toLowerCase() === 'k') {
      console.log('K key pressed - slide');
      this.slidePressedThisFrame = true;
    }
    
    // Hurt1 pressed only fires once per key press (1 key)
    if (!wasPressed && e.key === '1') {
      console.log('1 key pressed - hurt1');
      this.hurt1PressedThisFrame = true;
    }
    
    // Hurt2 pressed only fires once per key press (2 key)
    if (!wasPressed && e.key === '2') {
      console.log('2 key pressed - hurt2');
      this.hurt2PressedThisFrame = true;
    }
    
    // Death pressed only fires once per key press (0 key)
    if (!wasPressed && e.key === '0') {
      console.log('0 key pressed - death');
      this.deathPressedThisFrame = true;
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keys.delete(e.key.toLowerCase());
  }

  update() {
    // Movement
    this.left = this.keys.has('a') || this.keys.has('arrowleft');
    this.right = this.keys.has('d') || this.keys.has('arrowright');
    
    // Jump
    this.jumpHeld = this.keys.has('w') || this.keys.has(' ');
    this.jumpPressed = this.jumpPressedThisFrame;
    this.jumpPressedThisFrame = false; // Reset for next frame
    
    // Run modifier
    this.runHeld = this.keys.has('shift');
    
    // Reset
    this.resetPressed = this.keys.has('r');
    
    // Shoot
    this.shootPressed = this.shootPressedThisFrame;
    this.shootPressedThisFrame = false; // Reset for next frame
    
    // Slide
    this.slidePressed = this.slidePressedThisFrame;
    this.slidePressedThisFrame = false; // Reset for next frame
    
    // Hurt1
    this.hurt1Pressed = this.hurt1PressedThisFrame;
    this.hurt1PressedThisFrame = false; // Reset for next frame
    
    // Hurt2
    this.hurt2Pressed = this.hurt2PressedThisFrame;
    this.hurt2PressedThisFrame = false; // Reset for next frame
    
    // Death
    this.deathPressed = this.deathPressedThisFrame;
    this.deathPressedThisFrame = false; // Reset for next frame
  }
}